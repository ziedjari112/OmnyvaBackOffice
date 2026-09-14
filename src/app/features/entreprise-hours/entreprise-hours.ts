import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrepriseWorkingHoursService } from '../../core/services/entreprise-working-hours.service';
import { DayOfWeekName, EntrepriseWorkingHoursDto } from '../../core/models/entreprise-working-hours.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const DAYS_OF_WEEK: DayOfWeekName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function defaultWorkingHours(): EntrepriseWorkingHoursDto[] {
  return DAYS_OF_WEEK.map((dayOfWeek) => ({
    dayOfWeek,
    isDayOff: dayOfWeek === 'Sunday',
    startTime: '09:00',
    endTime: '18:00'
  }));
}

function toTimeInputValue(time?: string | null): string {
  return time ? time.slice(0, 5) : '';
}

function toApiTimeValue(time: string): string | null {
  if (!time) return null;
  return time.length === 5 ? `${time}:00` : time;
}

@Component({
  selector: 'app-entreprise-hours',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './entreprise-hours.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class EntrepriseHours {
  private readonly workingHoursService = inject(EntrepriseWorkingHoursService);

  readonly workingHours = signal<EntrepriseWorkingHoursDto[]>(defaultWorkingHours());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);

  constructor() {
    this.workingHoursService.get().subscribe((days) => {
      const byDay = new Map(days.map((d) => [d.dayOfWeek, d]));
      this.workingHours.set(defaultWorkingHours().map((fallback) => byDay.get(fallback.dayOfWeek) ?? fallback));
      this.loading.set(false);
    });
  }

  timeInputValue(day: EntrepriseWorkingHoursDto, field: 'startTime' | 'endTime'): string {
    return toTimeInputValue(day[field]);
  }

  toggleDayOff(dayOfWeek: DayOfWeekName, isDayOff: boolean): void {
    this.workingHours.update((days) => days.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isDayOff } : d)));
    this.saved.set(false);
  }

  updateDayTime(dayOfWeek: DayOfWeekName, field: 'startTime' | 'endTime', value: string): void {
    this.workingHours.update((days) => days.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)));
    this.saved.set(false);
  }

  save(): void {
    const dto = {
      days: this.workingHours().map((d) => ({
        ...d,
        startTime: d.isDayOff ? null : toApiTimeValue(toTimeInputValue(d.startTime)),
        endTime: d.isDayOff ? null : toApiTimeValue(toTimeInputValue(d.endTime))
      }))
    };

    this.saving.set(true);
    this.workingHoursService.set(dto).subscribe({
      next: (days) => {
        this.workingHours.set(days);
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => this.saving.set(false)
    });
  }
}
