import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResultDto, LoginDto, UserDto } from '../models/auth.model';

const STORAGE_KEY = 'omnyva.backoffice.auth';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = signal<StoredAuth | null>(this.readFromStorage());

  readonly currentUser = computed(() => this.authState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.authState() !== null);
  readonly accessToken = computed(() => this.authState()?.accessToken ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(dto: LoginDto): Observable<AuthResultDto> {
    return this.http
      .post<AuthResultDto>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap((result) => this.setSession(result)));
  }

  refresh(): Observable<AuthResultDto> {
    const refreshToken = this.authState()?.refreshToken;
    return this.http
      .post<AuthResultDto>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap((result) => this.setSession(result)));
  }

  logout(): void {
    const refreshToken = this.authState()?.refreshToken;
    this.authState.set(null);
    localStorage.removeItem(STORAGE_KEY);
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({ error: () => void 0 });
    }
    this.router.navigate(['/login']);
  }

  getRefreshToken(): string | null {
    return this.authState()?.refreshToken ?? null;
  }

  private setSession(result: AuthResultDto): void {
    const stored: StoredAuth = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
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
