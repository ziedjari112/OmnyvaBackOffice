import { Injectable, effect, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { NotificationDto } from '../models/notification.model';
import { ChatMessageDto, ChatReadReceiptDto } from '../models/chat.model';

/**
 * Live push channel for notifications and chat messages (see
 * Omnyva.Infrastructure/Realtime/NotificationsHub.cs — both travel over the same per-user
 * connection, just under different event names). Connects once a user is authenticated so the
 * unread badge, the toast popup and any open chat thread update instantly instead of polling.
 */
@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private connection: signalR.HubConnection | null = null;

  private readonly notificationReceivedSource = new Subject<NotificationDto>();
  readonly notificationReceived$ = this.notificationReceivedSource.asObservable();

  private readonly chatMessageReceivedSource = new Subject<ChatMessageDto>();
  readonly chatMessageReceived$ = this.chatMessageReceivedSource.asObservable();

  private readonly chatThreadReadSource = new Subject<ChatReadReceiptDto>();
  readonly chatThreadRead$ = this.chatThreadReadSource.asObservable();

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) this.connect();
      else this.disconnect();
    });
  }

  private connect(): void {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.filesBaseUrl}/hubs/notifications`, {
        accessTokenFactory: () => this.auth.accessToken() ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('notificationReceived', (notification: NotificationDto) => {
      this.notificationReceivedSource.next(notification);
      this.toastService.show(notification.title, notification.message);
    });

    this.connection.on('chatMessageReceived', (message: ChatMessageDto) => {
      this.chatMessageReceivedSource.next(message);
    });

    this.connection.on('chatThreadRead', (receipt: ChatReadReceiptDto) => {
      this.chatThreadReadSource.next(receipt);
    });

    this.connection.start().catch(() => void 0);
  }

  private disconnect(): void {
    const connection = this.connection;
    this.connection = null;
    connection?.stop().catch(() => void 0);
  }
}
