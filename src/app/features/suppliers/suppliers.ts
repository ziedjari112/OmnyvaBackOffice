import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../core/services/supplier.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { I18nService } from '../../core/services/i18n.service';
import { SupplierDto, SupplierUpsertDto } from '../../core/models/supplier.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: SupplierUpsertDto = {
  name: '',
  phone: null,
  email: null,
  address: null,
  entrepriseId: 0
};

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './suppliers.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Suppliers {
  private readonly supplierService = inject(SupplierService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly i18n = inject(I18nService);

  readonly suppliers = signal<SupplierDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<SupplierUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
  }

  load(): void {
    this.loading.set(true);
    this.supplierService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.suppliers.set(result.items);
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

  openEdit(supplier: SupplierDto): void {
    this.editingId.set(supplier.id);
    this.form.set({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      entrepriseId: supplier.entrepriseId
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
    const request = id ? this.supplierService.update(id, this.form()) : this.supplierService.create(this.form());

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

  remove(supplier: SupplierDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${supplier.name})`)) return;
    this.supplierService.delete(supplier.id).subscribe(() => this.load());
  }
}
