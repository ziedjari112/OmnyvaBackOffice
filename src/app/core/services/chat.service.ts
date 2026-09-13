import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { NotificationHubService } from './notification-hub.service';
import { ChatMessageDto, ChatRecipientDto, ChatThreadDto } from '../models/chat.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chat`;
  private readonly auth = inject(AuthService);
  private readonly notificationHub = inject(NotificationHubService);

  /** Total unread client messages across every thread — backs the sidebar "Chat" badge, kept in
   * sync with the server (rather than incremented locally) so it never drifts. */
  readonly unreadCount = signal(0);

  constructor(private readonly http: HttpClient) {
    effect(() => {
      if (this.auth.isAuthenticated()) this.refreshUnreadCount();
      else this.unreadCount.set(0);
    });

    this.notificationHub.chatMessageReceived$.subscribe(() => this.refreshUnreadCount());
    this.notificationHub.chatThreadRead$.subscribe(() => this.refreshUnreadCount());
  }

  refreshUnreadCount(): void {
    if (!this.auth.isAuthenticated()) return;
    this.getUnreadCount().subscribe((count) => this.unreadCount.set(count));
  }

  getThreads(query: BasePaginatedQuery): Observable<BasePaginatedList<ChatThreadDto>> {
    return this.http.post<BasePaginatedList<ChatThreadDto>>(`${this.baseUrl}/threads/list`, query);
  }

  getThreadMessages(threadId: number, query: BasePaginatedQuery): Observable<BasePaginatedList<ChatMessageDto>> {
    return this.http.post<BasePaginatedList<ChatMessageDto>>(`${this.baseUrl}/threads/${threadId}/messages/list`, query);
  }

  sendThreadMessage(threadId: number, body: string): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/threads/${threadId}/messages`, { body });
  }

  markThreadRead(threadId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/threads/${threadId}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/threads/unread-count`);
  }

  getRecipients(): Observable<ChatRecipientDto[]> {
    return this.http.get<ChatRecipientDto[]>(`${this.baseUrl}/recipients`);
  }

  setRecipients(userIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/recipients`, { userIds });
  }
}
