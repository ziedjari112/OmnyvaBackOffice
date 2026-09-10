import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResultDto, LoginDto, Portal, UserDto } from '../models/auth.model';

const STORAGE_KEY = 'omnyva.backoffice.auth';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  portal: Portal;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = signal<StoredAuth | null>(this.readFromStorage());

  readonly currentUser = computed(() => this.authState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.authState() !== null);
  readonly accessToken = computed(() => this.authState()?.accessToken ?? null);
  // Which login endpoint was used — keeps the staff back office and the customer client space as two
  // distinct shells even though they share the same Angular app, routing table, and JWT scheme.
  readonly portal = computed(() => this.authState()?.portal ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  // Whether this account is allowed into the back office (i.e. not a customer-only account) is
  // verified server-side by this dedicated endpoint, not by inspecting result.user.roles here.
  login(dto: LoginDto): Observable<AuthResultDto> {
    return this.http
      .post<AuthResultDto>(`${environment.apiUrl}/auth/backoffice-login`, dto)
      .pipe(tap((result) => this.setSession(result, 'staff')));
  }

  // Requires the account to hold the Client role server-side — see Omnyva.Core.Services.AuthService.LoginClientAsync.
  loginClient(dto: LoginDto): Observable<AuthResultDto> {
    return this.http
      .post<AuthResultDto>(`${environment.apiUrl}/auth/client-login`, dto)
      .pipe(tap((result) => this.setSession(result, 'client')));
  }

  refresh(): Observable<AuthResultDto> {
    const refreshToken = this.authState()?.refreshToken;
    const portal = this.authState()?.portal ?? 'staff';
    return this.http
      .post<AuthResultDto>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap((result) => this.setSession(result, portal)));
  }

  logout(): void {
    const refreshToken = this.authState()?.refreshToken;
    const portal = this.authState()?.portal ?? 'staff';
    this.authState.set(null);
    localStorage.removeItem(STORAGE_KEY);
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({ error: () => void 0 });
    }
    this.router.navigate([portal === 'client' ? '/client-login' : '/login']);
  }

  getRefreshToken(): string | null {
    return this.authState()?.refreshToken ?? null;
  }

  private setSession(result: AuthResultDto, portal: Portal): void {
    const stored: StoredAuth = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      portal
    };
    this.authState.set(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  private readFromStorage(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredAuth) : null;
    } catch {
      return null;
    }
  }
}
