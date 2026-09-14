import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { StaffAttendanceStatusDto } from '../../core/models/attendance.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './attendance.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Attendance {
  private readonly attendanceService = inject(AttendanceService);

  readonly date = signal(todayIso());
  readonly rows = signal<StaffAttendanceStatusDto[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  onDateChange(value: string): void {
    this.date.set(value);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.attendanceService.getForDate(this.date()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  togglePresent(row: StaffAttendanceStatusDto): void {
    const nextValue = !row.isPresent;
    this.rows.update((items) => items.map((r) => (r.staffId === row.staffId ? { ...r, isPresent: nextValue } : r)));
    this.attendanceService.set(row.staffId, this.date(), { isPresent: nextValue }).subscribe({
      error: () => this.rows.update((items) => items.map((r) => (r.staffId === row.staffId ? { ...r, isPresent: !nextValue } : r)))
    });
  }
}
