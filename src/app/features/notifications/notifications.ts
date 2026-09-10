import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto } from '../../core/models/notification.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  templateUrl: './notifications.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Notifications {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = signal<NotificationDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.notificationService.getMine({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
      next: (result) => {
        this.notifications.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markAsRead(notification: NotificationDto): void {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.notifications.update((items) =>
        items.map((n) => (n.id === notification.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    });
  }

  markAsUnread(notification: NotificationDto): void {
    this.notificationService.markAsUnread(notification.id).subscribe(() => {
      this.notifications.update((items) =>
        items.map((n) => (n.id === notification.id ? { ...n, isRead: false, readAt: null } : n))
      );
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }
}
