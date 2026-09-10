import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { I18nService } from '../../../core/services/i18n.service';
import { MenuService } from '../../../core/services/menu.service';
import { EntrepriseService } from '../../../core/services/entreprise.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Locale } from '../../../core/i18n/translations';
import { MenuDto } from '../../../core/models/menu.model';
import { EntrepriseDto } from '../../../core/models/entreprise.model';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly tenant = inject(TenantService);
  protected readonly i18n = inject(I18nService);
  private readonly menuService = inject(MenuService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly locales: Locale[] = ['en', 'fr', 'ar'];
  protected readonly menuItems = signal<MenuDto[]>([]);
  protected readonly availableEntreprises = signal<EntrepriseDto[]>([]);
  protected readonly unreadNotificationCount = signal(0);

  protected readonly entrepriseSelectValue = computed(() => this.tenant.currentEntrepriseId()?.toString() ?? '');

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.menuService.getMine().subscribe((items) => this.menuItems.set(items));
      }
    });

    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.entrepriseService.getMine().subscribe((entreprises) => this.availableEntreprises.set(entreprises));
      } else {
        this.availableEntreprises.set([]);
      }
    });

    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refreshUnreadCount();
      } else {
        this.unreadNotificationCount.set(0);
      }
    });

    // Light polling — no real-time push infra, so this is what keeps the badge from going stale
    // while the user stays on one page (e.g. after a staff member's reservation gets confirmed).
    const intervalId = setInterval(() => {
      if (this.auth.isAuthenticated()) this.refreshUnreadCount();
    }, 60_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  private refreshUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe((count) => this.unreadNotificationCount.set(count));
  }

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }

  onEntrepriseChange(value: string): void {
    this.tenant.setEntreprise(value ? Number(value) : null);
    location.reload();
  }
}
