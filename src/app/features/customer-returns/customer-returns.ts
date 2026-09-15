import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerReturnService } from '../../core/services/customer-return.service';
import { CustomerReturnDto } from '../../core/models/customer-return.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-customer-returns',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DatePipe],
  templateUrl: './customer-returns.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class CustomerReturns {
  private readonly returnService = inject(CustomerReturnService);

  readonly returns = signal<CustomerReturnDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);
  readonly expandedId = signal<number | null>(null);

  readonly busyId = signal<number | null>(null);
  readonly errorId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly rejectDialogId = signal<number | null>(null);
  readonly rejectReason = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.returnService.getPaged({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
      next: (result) => {
        this.returns.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }

  toggleExpand(customerReturn: CustomerReturnDto): void {
    this.expandedId.set(this.expandedId() === customerReturn.id ? null : customerReturn.id);
  }

  approve(customerReturn: CustomerReturnDto): void {
    this.run(customerReturn.id, this.returnService.approve(customerReturn.id));
  }

  openRejectDialog(customerReturn: CustomerReturnDto): void {
    this.rejectDialogId.set(customerReturn.id);
    this.rejectReason.set('');
  }

  closeRejectDialog(): void {
    this.rejectDialogId.set(null);
    this.rejectReason.set('');
  }

  confirmReject(customerReturn: CustomerReturnDto): void {
    const reason = this.rejectReason().trim();
    this.run(customerReturn.id, this.returnService.reject(customerReturn.id, reason || undefined));
    this.closeRejectDialog();
  }

  private run(id: number, request: ReturnType<CustomerReturnService['approve']>): void {
    this.busyId.set(id);
    this.errorId.set(null);
    this.errorMessage.set(null);
    request.subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.returns.update((list) => list.map((r) => (r.id === id ? updated : r)));
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorId.set(id);
        this.errorMessage.set((err.error as { error?: string } | null)?.error ?? 'common.error.generic');
      }
    });
  }
}
