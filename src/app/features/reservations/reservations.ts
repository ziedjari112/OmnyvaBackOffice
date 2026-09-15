import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDto } from '../../core/models/reservation.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DatePipe],
  templateUrl: './reservations.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Reservations {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<ReservationDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly busyId = signal<number | null>(null);
  readonly errorId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly cancelDialogId = signal<number | null>(null);
  readonly cancelReason = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reservationService.getPaged({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
      next: (result) => {
        this.reservations.set(result.items);
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

  confirm(reservation: ReservationDto): void {
    this.run(reservation.id, this.reservationService.confirm(reservation.id));
  }

  complete(reservation: ReservationDto): void {
    this.run(reservation.id, this.reservationService.complete(reservation.id));
  }

  decline(reservation: ReservationDto): void {
    this.run(reservation.id, this.reservationService.cancel(reservation.id));
  }

  openCancelDialog(reservation: ReservationDto): void {
    this.cancelDialogId.set(reservation.id);
    this.cancelReason.set('');
  }

  closeCancelDialog(): void {
    this.cancelDialogId.set(null);
    this.cancelReason.set('');
  }

  confirmCancel(reservation: ReservationDto): void {
    const reason = this.cancelReason().trim();
    this.run(reservation.id, this.reservationService.cancel(reservation.id, reason || undefined));
    this.closeCancelDialog();
  }

  private run(id: number, request: ReturnType<ReservationService['confirm']>): void {
    this.busyId.set(id);
    this.errorId.set(null);
    this.errorMessage.set(null);
    request.subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.reservations.update((list) => list.map((r) => (r.id === id ? updated : r)));
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.errorId.set(id);
        this.errorMessage.set((err.error as { error?: string } | null)?.error ?? 'common.error.generic');
      }
    });
  }
}
