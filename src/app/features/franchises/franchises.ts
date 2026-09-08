import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FranchiseService } from '../../core/services/franchise.service';
import { CompanyService } from '../../core/services/company.service';
import { I18nService } from '../../core/services/i18n.service';
import { FranchiseDto, FranchiseUpsertDto } from '../../core/models/franchise.model';
import { CompanyDto } from '../../core/models/company.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: FranchiseUpsertDto = {
  name: '',
  companyId: 0,
  description: null,
  address: null,
  city: null,
  phone: null,
  email: null,
  latitude: null,
  longitude: null
};

@Component({
  selector: 'app-franchises',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './franchises.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Franchises {
  private readonly franchiseService = inject(FranchiseService);
  private readonly companyService = inject(CompanyService);
  private readonly i18n = inject(I18nService);

  readonly franchises = signal<FranchiseDto[]>([]);
  readonly companies = signal<CompanyDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<FranchiseUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.companyService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.companies.set(result.items));
  }

  load(): void {
    this.loading.set(true);
    this.franchiseService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.franchises.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  companyName(companyId: number): string {
    return this.companies().find((c) => c.id === companyId)?.name ?? '';
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
    this.form.set({ ...EMPTY_FORM, companyId: this.companies()[0]?.id ?? 0 });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(franchise: FranchiseDto): void {
    this.editingId.set(franchise.id);
    this.form.set({
      name: franchise.name,
      companyId: franchise.companyId,
      description: franchise.description,
      address: franchise.address,
      city: franchise.city,
      phone: franchise.phone,
      email: franchise.email,
      latitude: franchise.latitude,
      longitude: franchise.longitude
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
    const request = id ? this.franchiseService.update(id, this.form()) : this.franchiseService.create(this.form());

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

  remove(franchise: FranchiseDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${franchise.name})`)) return;
    this.franchiseService.delete(franchise.id).subscribe(() => this.load());
  }
}
