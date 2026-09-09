import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDto } from '../../core/models/reservation.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DatePipe],
  templateUrl: './my-reservations.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class MyReservations {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<ReservationDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reservationService.getMine({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
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
}
