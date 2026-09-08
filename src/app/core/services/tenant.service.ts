import { Injectable, computed, effect, signal } from '@angular/core';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'omnyva.backoffice.entrepriseId';

/**
 * Tracks which entreprise the user is currently "acting as" — sent as the X-Entreprise-Id header on
 * every request. Permissions from entreprise-scoped roles (see UserDto.roleAssignments) only apply
 * when this matches; global roles (EntrepriseId = null on the assignment) apply regardless.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly currentEntrepriseId = signal<number | null>(this.readInitial());

  /** Distinct entreprise ids the current user holds a entreprise-scoped role at. */
  readonly availableEntrepriseIds = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    const ids = user.roleAssignments.map((ra) => ra.entrepriseId).filter((id): id is number => id != null);
    return Array.from(new Set(ids));
  });

  /** True if the user has at least one global (non entreprise-scoped) role. */
  readonly hasGlobalRole = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.roleAssignments.some((ra) => ra.entrepriseId == null) : false;
  });

  constructor(private readonly authService: AuthService) {
    effect(() => {
      const id = this.currentEntrepriseId();
      if (id === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(id));
    });
  }

  setEntreprise(id: number | null): void {
    this.currentEntrepriseId.set(id);
  }

  private readInitial(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  }
}
