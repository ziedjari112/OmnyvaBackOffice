import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { OrderDto } from '../../core/models/order.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Orders {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);
  readonly expandedId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.orderService.getPaged({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
      next: (result) => {
        this.orders.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(order: OrderDto): void {
    this.expandedId.set(this.expandedId() === order.id ? null : order.id);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }
}
