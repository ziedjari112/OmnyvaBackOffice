import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionStatusDto } from '../models/subscription.model';

const EXPIRING_SOON_THRESHOLD_DAYS = 15;

/** Live status of the currently-scoped entreprise's subscription, driving both the "expires soon"
 * banner and the full-block screen — see SubscriptionGateMiddleware server-side for the actual
 * enforcement; this service is purely the UI reflection of that same rule. */
@Injectable({ providedIn: 'root' })
export class SubscriptionStatusService {
  private readonly auth = inject(AuthService);
  private readonly tenant = inject(TenantService);
  private readonly subscriptionService = inject(SubscriptionService);

  readonly status = signal<SubscriptionStatusDto | null>(null);

  /** SuperAdmin (or anyone with a global role) is never affected by the gate — same bypass as the
   * server-side middleware, so the UI never blocks the one role that manages subscriptions. */
  private readonly isExempt = computed(() => this.tenant.hasGlobalRole());

  readonly isExpired = computed(() => !this.isExempt() && (this.status()?.isExpired ?? false));

  readonly isExpiringSoon = computed(() => {
    if (this.isExempt()) return false;
    const s = this.status();
    if (!s || !s.hasSubscription || s.isExpired) return false;
    return (s.daysUntilExpiry ?? Infinity) <= EXPIRING_SOON_THRESHOLD_DAYS;
  });

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refresh();
      } else {
        this.status.set(null);
      }
    });

    // Re-check whenever the acted-as entreprise changes (the switcher does a hard reload today, but this
    // keeps the service correct even if that ever becomes a soft navigation).
    effect(() => {
      this.tenant.currentEntrepriseId();
      if (this.auth.isAuthenticated()) this.refresh();
    });
  }

  private refresh(): void {
    this.subscriptionService.getMine().subscribe((status) => this.status.set(status));
  }
}
