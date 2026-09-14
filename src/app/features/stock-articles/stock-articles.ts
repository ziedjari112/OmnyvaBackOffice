import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { FamilyService } from '../../core/services/family.service';
import { TenantService } from '../../core/services/tenant.service';
import { ProductDto, StockArticleDto } from '../../core/models/product.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { FamilyDto } from '../../core/models/family.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../core/pipes/money.pipe';

type StockStatusFilter = 'all' | 'inStock' | 'outOfStock';

@Component({
  selector: 'app-stock-articles',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MoneyPipe, DatePipe],
  templateUrl: './stock-articles.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class StockArticles {
  private readonly productService = inject(ProductService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly familyService = inject(FamilyService);
  protected readonly tenant = inject(TenantService);

  // Loaded once, fully — this is a read-focused overview page, so filtering happens client-side
  // over the whole catalog rather than round-tripping to the server per filter change.
  private readonly allProducts = signal<ProductDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly families = signal<FamilyDto[]>([]);
  readonly loading = signal(true);

  readonly searchTerm = signal('');
  readonly entrepriseFilter = signal<number | null>(null);
  readonly familyFilter = signal<number | null>(null);
  readonly stockStatusFilter = signal<StockStatusFilter>('all');

  readonly familiesForFilter = computed(() => {
    const entrepriseId = this.entrepriseFilter();
    const families = this.families();
    return entrepriseId ? families.filter((f) => f.entrepriseId === entrepriseId) : families;
  });

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const entrepriseId = this.entrepriseFilter();
    const familyId = this.familyFilter();
    const stockStatus = this.stockStatusFilter();

    return this.allProducts().filter((p) => {
      if (term && !p.name.toLowerCase().includes(term)) return false;
      if (entrepriseId && p.entrepriseId !== entrepriseId) return false;
      if (familyId && p.familyId !== familyId) return false;
      if (stockStatus === 'inStock' && p.stockQuantity <= 0) return false;
      if (stockStatus === 'outOfStock' && p.stockQuantity > 0) return false;
      return true;
    });
  });

  // History drawer
  readonly historyProduct = signal<ProductDto | null>(null);
  readonly historyItems = signal<StockArticleDto[]>([]);
  readonly historyLoading = signal(false);

  constructor() {
    this.load();
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
    this.familyService.getPaged({ pageNumber: 1, pageSize: 500 }).subscribe((result) => this.families.set(result.items));
  }

  load(): void {
    this.loading.set(true);
    this.productService.getPaged({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (result) => {
        this.allProducts.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  entrepriseName(entrepriseId: number): string {
    return this.entreprises().find((e) => e.id === entrepriseId)?.name ?? '';
  }

  onEntrepriseFilterChange(value: string): void {
    this.entrepriseFilter.set(value ? +value : null);
    // A family that only makes sense for a different entreprise is no longer a valid selection.
    const familyId = this.familyFilter();
    if (familyId && !this.familiesForFilter().some((f) => f.id === familyId)) {
      this.familyFilter.set(null);
    }
  }

  openHistory(product: ProductDto): void {
    this.historyProduct.set(product);
    this.historyItems.set([]);
    this.historyLoading.set(true);
    this.productService.getStockHistory(product.id).subscribe({
      next: (items) => {
        this.historyItems.set(items);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false)
    });
  }

  closeHistory(): void {
    this.historyProduct.set(null);
  }
}
