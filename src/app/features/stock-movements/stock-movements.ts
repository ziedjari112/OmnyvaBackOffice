import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockMovementService } from '../../core/services/stock-movement.service';
import { SupplierService } from '../../core/services/supplier.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { ProductService } from '../../core/services/product.service';
import { I18nService } from '../../core/services/i18n.service';
import {
  CreateStockMovementDto,
  CreateStockMovementLineDto,
  StockMovementDto,
  StockMovementType
} from '../../core/models/stock-movement.model';
import { SupplierDto } from '../../core/models/supplier.model';
import { EntrepriseDto } from '../../core/models/entreprise.model';
import { ProductDto } from '../../core/models/product.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface DraftLine {
  productId: number | null;
  quantity: number;
  unitPriceHT: number | null;
}

const EMPTY_LINE: DraftLine = { productId: null, quantity: 1, unitPriceHT: null };

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DecimalPipe, DatePipe],
  templateUrl: './stock-movements.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class StockMovements {
  private readonly stockMovementService = inject(StockMovementService);
  private readonly supplierService = inject(SupplierService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly productService = inject(ProductService);
  private readonly i18n = inject(I18nService);

  readonly types: StockMovementType[] = ['Receipt', 'Adjustment'];

  readonly movements = signal<StockMovementDto[]>([]);
  readonly suppliers = signal<SupplierDto[]>([]);
  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly products = signal<ProductDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);
  readonly expandedId = signal<number | null>(null);

  readonly showForm = signal(false);
  readonly type = signal<StockMovementType>('Receipt');
  readonly entrepriseId = signal<number>(0);
  readonly supplierId = signal<number | null>(null);
  readonly lines = signal<DraftLine[]>([]);
  readonly draftLine = signal<DraftLine>({ ...EMPTY_LINE });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
    this.supplierService.getPaged({ pageNumber: 1, pageSize: 500 }).subscribe((result) => this.suppliers.set(result.items));
    this.entrepriseService.getMine().subscribe((entreprises) => this.entreprises.set(entreprises));
    this.productService.getPaged({ pageNumber: 1, pageSize: 500 }).subscribe((result) => this.products.set(result.items));
  }

  get productsForCurrentEntreprise(): ProductDto[] {
    return this.products().filter((p) => p.entrepriseId === this.entrepriseId());
  }

  get suppliersForCurrentEntreprise(): SupplierDto[] {
    return this.suppliers().filter((s) => s.entrepriseId === this.entrepriseId());
  }

  load(): void {
    this.loading.set(true);
    this.stockMovementService.getPaged({ pageNumber: this.pageNumber(), pageSize: 20 }).subscribe({
      next: (result) => {
        this.movements.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  entrepriseName(entrepriseId: number): string {
    return this.entreprises().find((e) => e.id === entrepriseId)?.name ?? '';
  }

  toggleExpand(movement: StockMovementDto): void {
    this.expandedId.set(this.expandedId() === movement.id ? null : movement.id);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.load();
  }

  openCreate(): void {
    this.type.set('Receipt');
    this.entrepriseId.set(this.entreprises()[0]?.id ?? 0);
    this.supplierId.set(null);
    this.lines.set([]);
    this.draftLine.set({ ...EMPTY_LINE });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onTypeChange(value: StockMovementType): void {
    this.type.set(value);
    if (value === 'Adjustment') this.supplierId.set(null);
  }

  updateDraftLine<K extends keyof DraftLine>(field: K, value: DraftLine[K]): void {
    this.draftLine.update((l) => ({ ...l, [field]: value }));
  }

  productName(productId: number): string {
    return this.products().find((p) => p.id === productId)?.name ?? '';
  }

  addLine(): void {
    const draft = this.draftLine();
    if (!draft.productId || !draft.quantity) return;
    if (this.type() === 'Receipt' && !draft.unitPriceHT) return;

    this.lines.update((current) => [...current, draft]);
    this.draftLine.set({ ...EMPTY_LINE });
  }

  removeLine(index: number): void {
    this.lines.update((current) => current.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.lines().length === 0) {
      this.error.set('stockMovements.error.noLines');
      return;
    }
    if (this.type() === 'Receipt' && !this.supplierId()) {
      this.error.set('stockMovements.error.supplierRequired');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const dto: CreateStockMovementDto = {
      type: this.type(),
      entrepriseId: this.entrepriseId(),
      supplierId: this.type() === 'Receipt' ? this.supplierId() : null,
      lines: this.lines().map(
        (l): CreateStockMovementLineDto => ({
          productId: l.productId!,
          quantity: l.quantity,
          unitPriceHT: this.type() === 'Receipt' ? l.unitPriceHT : null
        })
      )
    };

    this.stockMovementService.create(dto).subscribe({
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
}
