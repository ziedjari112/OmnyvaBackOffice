import { Injectable, computed, effect, signal } from '@angular/core';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'omnyva.backoffice.franchiseId';

/**
 * Tracks which franchise the user is currently "acting as" — sent as the X-Franchise-Id header on
 * every request. Permissions from franchise-scoped roles (see UserDto.roleAssignments) only apply
 * when this matches; global roles (FranchiseId = null on the assignment) apply regardless.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly currentFranchiseId = signal<number | null>(this.readInitial());

  /** Distinct franchise ids the current user holds a franchise-scoped role at. */
  readonly availableFranchiseIds = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const ids = user.roleAssignments.map((ra) => ra.franchiseId).filter((id): id is number => id != null);
    return Array.from(new Set(ids));
  });

  /** True if the user has at least one global (non franchise-scoped) role. */
  readonly hasGlobalRole = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.roleAssignments.some((ra) => ra.franchiseId == null) : false;
  });

  constructor(private readonly authService: AuthService) {
    effect(() => {
      const id = this.currentFranchiseId();
      if (id === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(id));
    });
  }

  setFranchise(id: number | null): void {
    this.currentFranchiseId.set(id);
  }

  private readInitial(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  }
}
