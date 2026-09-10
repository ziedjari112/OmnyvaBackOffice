import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { TenantService } from '../../core/services/tenant.service';
import { LoyaltyReferenceLookupDto } from '../../core/models/loyalty.model';
import { ProductDto } from '../../core/models/product.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface DraftLine {
  productId: number;
  quantity: number;
}

@Component({
  selector: 'app-loyalty-award',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './loyalty-award.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class LoyaltyAward {
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  protected readonly tenant = inject(TenantService);

  readonly referenceCode = signal('');
  readonly lookingUp = signal(false);
  readonly lookupError = signal<string | null>(null);
  readonly customer = signal<LoyaltyReferenceLookupDto | null>(null);

  readonly products = signal<ProductDto[]>([]);
  readonly lines = signal<DraftLine[]>([]);
  readonly newLineProductId = signal<number | null>(null);
  readonly newLineQuantity = signal(1);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.products.set(result.items));
  }

  get productsForCurrentEntreprise(): ProductDto[] {
    const entrepriseId = this.tenant.currentEntrepriseId();
    return this.products().filter((p) => p.entrepriseId === entrepriseId);
  }

  productName(productId: number): string {
    return this.products().find((p) => p.id === productId)?.name ?? '';
  }

  lookup(): void {
    const code = this.referenceCode().trim();
    if (!code) return;

    this.lookingUp.set(true);
    this.lookupError.set(null);
    this.customer.set(null);

    this.loyaltyService.lookupByReference(code).subscribe({
      next: (result) => {
        this.customer.set(result);
        this.lookingUp.set(false);
      },
      error: () => {
        this.lookupError.set('loyalty.award.notFound');
        this.lookingUp.set(false);
      }
    });
  }

  addLine(): void {
    const productId = this.newLineProductId();
    const quantity = this.newLineQuantity();
    if (!productId || quantity < 1) return;

    this.lines.update((lines) => {
      const existing = lines.find((l) => l.productId === productId);
      if (existing) return lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l));
      return [...lines, { productId, quantity }];
    });

    this.newLineProductId.set(null);
    this.newLineQuantity.set(1);
  }

  removeLine(productId: number): void {
    this.lines.update((lines) => lines.filter((l) => l.productId !== productId));
  }

  submit(): void {
    const customer = this.customer();
    const entrepriseId = this.tenant.currentEntrepriseId();
    if (!customer || !entrepriseId || this.lines().length === 0) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.orderService
      .createWalkIn({ referenceCode: this.referenceCode().trim(), entrepriseId, lines: this.lines() })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.lines.set([]);
          this.customer.set(null);
          this.referenceCode.set('');
          this.loadProducts();
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('common.error.generic');
        }
      });
  }

  reset(): void {
    this.submitted.set(false);
  }
}
