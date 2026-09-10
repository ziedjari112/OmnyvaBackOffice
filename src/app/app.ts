import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { ClientHeader } from './shared/components/client-header/client-header';
import { ToastContainer } from './shared/components/toast/toast';
import { AuthService } from './core/services/auth.service';
import { NotificationHubService } from './core/services/notification-hub.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, ClientHeader, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthService);

  // Injected only to start its lifecycle (connects to the notifications hub once authenticated) —
  // not otherwise used from this component.
  private readonly notificationHub = inject(NotificationHubService);
}
