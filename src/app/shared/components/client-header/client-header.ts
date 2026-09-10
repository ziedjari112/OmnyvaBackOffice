import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationHubService } from '../../../core/services/notification-hub.service';
import { Locale } from '../../../core/i18n/translations';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

/** Minimal nav shell for the customer (client-portal) space — deliberately separate from <app-header>
 * so a customer only ever sees their own pages (loyalty points, notifications, account), never the
 * staff back-office menu tree. */
@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './client-header.html',
  styleUrl: './client-header.scss'
})
export class ClientHeader {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly notificationService = inject(NotificationService);
  private readonly notificationHub = inject(NotificationHubService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly locales: Locale[] = ['en', 'fr', 'ar'];
  protected readonly unreadNotificationCount = signal(0);

  constructor() {
    this.refreshUnreadCount();

    const intervalId = setInterval(() => this.refreshUnreadCount(), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));

    this.notificationHub.notificationReceived$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.unreadNotificationCount.update((c) => c + 1));
  }

  private refreshUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe((count) => this.unreadNotificationCount.set(count));
  }

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }
}
