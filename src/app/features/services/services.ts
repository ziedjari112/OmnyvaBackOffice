import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { I18nService } from '../../core/services/i18n.service';
import { ServiceDto, ServiceUpsertDto } from '../../core/models/service.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: ServiceUpsertDto = {
  name: '',
  description: null,
  price: 0,
  durationMinutes: 30,
  entrepriseId: 0,
  loyaltyPoints: 0
};

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './services.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Services {
  private readonly serviceService = inject(ServiceService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly i18n = inject(I18nService);

  readonly services = signal<ServiceDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<ServiceUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
  }

  load(): void {
    this.loading.set(true);
    this.serviceService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.services.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
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
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(service: ServiceDto): void {
    this.editingId.set(service.id);
    this.form.set({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      entrepriseId: service.entrepriseId,
      loyaltyPoints: service.loyaltyPoints
    });
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
    const request = id ? this.serviceService.update(id, this.form()) : this.serviceService.create(this.form());

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('common.error.generic');
      }
    });
  }

  remove(service: ServiceDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${service.name})`)) return;
    this.serviceService.delete(service.id).subscribe(() => this.load());
  }
}
