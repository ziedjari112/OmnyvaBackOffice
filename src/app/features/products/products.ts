import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { FamilyService } from '../../core/services/family.service';
import { UploadService } from '../../core/services/upload.service';
import { I18nService } from '../../core/services/i18n.service';
import { ProductDto, ProductUpsertDto } from '../../core/models/product.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { FamilyDto } from '../../core/models/family.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: ProductUpsertDto = {
  name: '',
  description: null,
  price: 0,
  entrepriseId: 0,
  familyId: null,
  imageUrl: null,
  loyaltyPoints: 0
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './products.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly familyService = inject(FamilyService);
  protected readonly uploadService = inject(UploadService);
  private readonly i18n = inject(I18nService);

  readonly products = signal<ProductDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly families = signal<FamilyDto[]>([]);
  readonly loading = signal(true);
  readonly uploadingImage = signal(false);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<ProductUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
    this.familyService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.families.set(result.items));
  }

  get familiesForCurrentEntreprise(): FamilyDto[] {
    return this.families().filter((f) => f.entrepriseId === this.form().entrepriseId);
  }

  load(): void {
    this.loading.set(true);
    this.productService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.products.set(result.items);
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

  openEdit(product: ProductDto): void {
    this.editingId.set(product.id);
    this.form.set({
      name: product.name,
      description: product.description,
      price: product.price,
      entrepriseId: product.entrepriseId,
      familyId: product.familyId ?? null,
      imageUrl: product.imageUrl ?? null,
      loyaltyPoints: product.loyaltyPoints
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingImage.set(true);
    this.uploadService.uploadImage(file, 'products').subscribe({
      next: (url) => {
        this.form.update((f) => ({ ...f, imageUrl: url }));
        this.uploadingImage.set(false);
      },
      error: () => {
        this.uploadingImage.set(false);
        this.error.set('common.error.generic');
      }
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request = id ? this.productService.update(id, this.form()) : this.productService.create(this.form());

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

  remove(product: ProductDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${product.name})`)) return;
    this.productService.delete(product.id).subscribe(() => this.load());
  }
}
