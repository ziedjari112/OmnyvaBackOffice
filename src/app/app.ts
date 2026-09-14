import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { ToastContainer } from './shared/components/toast/toast';
import { SubscriptionBanner } from './shared/components/subscription-banner/subscription-banner';
import { SubscriptionExpired } from './shared/components/subscription-expired/subscription-expired';
import { AuthService } from './core/services/auth.service';
import { NotificationHubService } from './core/services/notification-hub.service';
import { SubscriptionStatusService } from './core/services/subscription-status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, ToastContainer, SubscriptionBanner, SubscriptionExpired],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly subscriptionStatus = inject(SubscriptionStatusService);

  // Injected only to start its lifecycle (connects to the notifications hub once authenticated) —
  // not otherwise used from this component.
  private readonly notificationHub = inject(NotificationHubService);
}
