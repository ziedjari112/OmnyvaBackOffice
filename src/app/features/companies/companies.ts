import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { CompanyDto, CompanyUpsertDto } from '../../core/models/company.model';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: CompanyUpsertDto = {
  name: '',
  matriculeFiscal: '',
  description: null,
  email: null,
  phone: null,
  address: null,
  city: null,
  registerCommerceNumber: null,
  legalForm: null,
  website: null,
  logoUrl: null
};

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './companies.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Companies {
  private readonly companyService = inject(CompanyService);
  private readonly i18n = inject(I18nService);

  readonly companies = signal<CompanyDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<CompanyUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.companyService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.companies.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
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
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.showForm.set(true);
  }

  openEdit(company: CompanyDto): void {
    this.editingId.set(company.id);
    this.form.set({
      name: company.name,
      description: company.description,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      matriculeFiscal: company.matriculeFiscal,
      registerCommerceNumber: company.registerCommerceNumber,
      legalForm: company.legalForm,
      website: company.website,
      logoUrl: company.logoUrl
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
    const request = id ? this.companyService.update(id, this.form()) : this.companyService.create(this.form());

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

  remove(company: CompanyDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${company.name})`)) return;
    this.companyService.delete(company.id).subscribe(() => this.load());
  }
}
