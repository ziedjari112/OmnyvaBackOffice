import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { NotificationHubService } from '../../core/services/notification-hub.service';
import { ChatMessageDto, ChatThreadDto } from '../../core/models/chat.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat {
  private readonly chatService = inject(ChatService);
  private readonly notificationHub = inject(NotificationHubService);

  readonly threads = signal<ChatThreadDto[]>([]);
  readonly loadingThreads = signal(true);
  readonly selectedThread = signal<ChatThreadDto | null>(null);
  readonly messages = signal<ChatMessageDto[]>([]);
  readonly loadingMessages = signal(false);
  readonly draft = signal('');
  readonly sending = signal(false);

  constructor() {
    this.loadThreads();

    this.notificationHub.chatMessageReceived$.pipe(takeUntilDestroyed()).subscribe((message) => {
      this.loadThreads();

      const selected = this.selectedThread();
      if (selected && message.chatThreadId === selected.id) {
        this.messages.update((items) => [...items, message]);
        this.chatService.markThreadRead(selected.id).subscribe(() => this.chatService.refreshUnreadCount());
      }
    });

    this.notificationHub.chatThreadRead$.pipe(takeUntilDestroyed()).subscribe((receipt) => {
      if (!receipt.readByClient) return;

      const selected = this.selectedThread();
      if (!selected || receipt.chatThreadId !== selected.id) return;

      this.messages.update((items) =>
        items.map((m) => (!m.isFromClient ? { ...m, isReadByClient: true } : m))
      );
    });
  }

  loadThreads(): void {
    this.chatService.getThreads({ pageNumber: 1, pageSize: 50 }).subscribe({
      next: (result) => {
        this.threads.set(result.items);
        this.loadingThreads.set(false);
      },
      error: () => this.loadingThreads.set(false)
    });
  }

  selectThread(thread: ChatThreadDto): void {
    this.selectedThread.set(thread);
    this.loadingMessages.set(true);
    this.messages.set([]);

    this.chatService.getThreadMessages(thread.id, { pageNumber: 1, pageSize: 200 }).subscribe({
      next: (result) => {
        this.messages.set(result.items);
        this.loadingMessages.set(false);
      },
      error: () => this.loadingMessages.set(false)
    });

    if (thread.unreadCount > 0) {
      this.chatService.markThreadRead(thread.id).subscribe(() => {
        this.threads.update((items) => items.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t)));
        this.chatService.refreshUnreadCount();
      });
    }
  }

  send(): void {
    const thread = this.selectedThread();
    const body = this.draft().trim();
    if (!thread || !body) return;

    this.sending.set(true);
    this.chatService.sendThreadMessage(thread.id, body).subscribe({
      next: (message) => {
        this.messages.update((items) => [...items, message]);
        this.draft.set('');
        this.sending.set(false);
        this.loadThreads();
      },
      error: () => this.sending.set(false)
    });
  }
}
