import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { ServiceDto } from '../../core/models/service.model';
import {
  SetStaffWorkingHoursDto,
  StaffDto,
  StaffUpsertDto,
  StaffWorkingHoursDto,
} from '../../core/models/staff.model';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { I18nService } from '../../core/services/i18n.service';
import { ServiceService } from '../../core/services/service.service';
import { StaffService } from '../../core/services/staff.service';

const EMPTY_FORM: StaffUpsertDto = {
  name: '',
  phone: null,
  email: null,
  entrepriseId: 0,
};

const DAYS_OF_WEEK: StaffWorkingHoursDto['dayOfWeek'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function defaultWorkingHours(): StaffWorkingHoursDto[] {
  return DAYS_OF_WEEK.map((dayOfWeek) => ({
    dayOfWeek,
    isDayOff: dayOfWeek === 'Sunday',
    startTime: '09:00',
    endTime: '18:00',
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
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './staff.html',
  styleUrl: '../../shared/styles/crud-page.scss',
})
export class Staff {
  private readonly staffService = inject(StaffService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly serviceService = inject(ServiceService);
  private readonly i18n = inject(I18nService);

  readonly staff = signal<StaffDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly services = signal<ServiceDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<StaffUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly assignedServiceIds = signal<Set<number>>(new Set());
  readonly savingServices = signal(false);

  readonly workingHours = signal<StaffWorkingHoursDto[]>([]);
  readonly savingHours = signal(false);
  readonly hoursSaved = signal(false);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.entrepriseService
      .getPaged({ pageNumber: 1, pageSize: 200 })
      .subscribe((result) => this.entreprises.set(result.items));
    this.serviceService
      .getPaged({ pageNumber: 1, pageSize: 500 })
      .subscribe((result) => this.services.set(result.items));
  }

  get servicesForCurrentEntreprise(): ServiceDto[] {
    return this.services().filter((s) => s.entrepriseId === this.form().entrepriseId);
  }

  isServiceAssigned(serviceId: number): boolean {
    return this.assignedServiceIds().has(serviceId);
  }

  toggleService(serviceId: number, checked: boolean): void {
    const id = this.editingId();
    if (!id) return;

    const next = new Set(this.assignedServiceIds());
    if (checked) next.add(serviceId);
    else next.delete(serviceId);

    this.savingServices.set(true);
    this.staffService.setServices(id, Array.from(next)).subscribe({
      next: (ids) => {
        this.assignedServiceIds.set(new Set(ids));
        this.savingServices.set(false);
      },
      error: () => this.savingServices.set(false),
    });
  }

  timeInputValue(day: StaffWorkingHoursDto, field: 'startTime' | 'endTime'): string {
    return toTimeInputValue(day[field]);
  }

  toggleDayOff(dayOfWeek: StaffWorkingHoursDto['dayOfWeek'], isDayOff: boolean): void {
    this.workingHours.update((days) =>
      days.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isDayOff } : d)),
    );
    this.hoursSaved.set(false);
  }

  updateDayTime(
    dayOfWeek: StaffWorkingHoursDto['dayOfWeek'],
    field: 'startTime' | 'endTime',
    value: string,
  ): void {
    this.workingHours.update((days) =>
      days.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)),
    );
    this.hoursSaved.set(false);
  }

  saveWorkingHours(): void {
    const id = this.editingId();
    if (!id) return;

    const dto: SetStaffWorkingHoursDto = {
      days: this.workingHours().map((d) => ({
        ...d,
        startTime: d.isDayOff ? null : toApiTimeValue(toTimeInputValue(d.startTime)),
        endTime: d.isDayOff ? null : toApiTimeValue(toTimeInputValue(d.endTime)),
      })),
    };

    this.savingHours.set(true);
    this.staffService.setWorkingHours(id, dto).subscribe({
      next: (days) => {
        this.workingHours.set(days);
        this.savingHours.set(false);
        this.hoursSaved.set(true);
      },
      error: () => this.savingHours.set(false),
    });
  }

  private loadWorkingHours(staffId: number): void {
    this.staffService.getWorkingHours(staffId).subscribe((days) => {
      const byDay = new Map(days.map((d) => [d.dayOfWeek, d]));
      this.workingHours.set(
        defaultWorkingHours().map((fallback) => byDay.get(fallback.dayOfWeek) ?? fallback),
      );
    });
  }

  load(): void {
    this.loading.set(true);
    this.staffService
      .getPaged({
        pageNumber: this.pageNumber(),
        pageSize: 20,
        searchTerm: this.searchTerm() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.staff.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  entrepriseName(entrepriseId: number): string {
    return this.entreprises().find((f) => f.id === entrepriseId)?.name ?? '';
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.pageNumber.set(1);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(), 300);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM, entrepriseId: this.entreprises()[0]?.id ?? 0 });
    this.assignedServiceIds.set(new Set());
    this.workingHours.set([]);
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(member: StaffDto): void {
    this.editingId.set(member.id);
    this.form.set({
      name: member.name,
      phone: member.phone,
      email: member.email,
      entrepriseId: member.entrepriseId,
    });
    this.assignedServiceIds.set(new Set());
    this.staffService
      .getServices(member.id)
      .subscribe((ids) => this.assignedServiceIds.set(new Set(ids)));
    this.hoursSaved.set(false);
    this.loadWorkingHours(member.id);
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request = id
      ? this.staffService.update(id, this.form())
      : this.staffService.create(this.form());

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('common.error.generic');
      },
    });
  }

  remove(member: StaffDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${member.name})`)) return;
    this.staffService.delete(member.id).subscribe(() => this.load());
  }
}
