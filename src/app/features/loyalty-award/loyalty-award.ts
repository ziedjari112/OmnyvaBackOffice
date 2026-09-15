import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { ServiceService } from '../../core/services/service.service';
import { TenantService } from '../../core/services/tenant.service';
import { LoyaltyReferenceLookupDto } from '../../core/models/loyalty.model';
import { ProductDto } from '../../core/models/product.model';
import { ServiceDto } from '../../core/models/service.model';
import { StaffDto } from '../../core/models/staff.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

interface DraftLine {
  productId: number;
  quantity: number;
}

interface DraftServiceLine {
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
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
  private readonly serviceService = inject(ServiceService);
  protected readonly tenant = inject(TenantService);

  readonly referenceCode = signal('');
  readonly lookingUp = signal(false);
  readonly lookupError = signal<string | null>(null);
  readonly customer = signal<LoyaltyReferenceLookupDto | null>(null);

  readonly products = signal<ProductDto[]>([]);
  readonly lines = signal<DraftLine[]>([]);
  readonly newLineProductId = signal<number | null>(null);
  readonly newLineQuantity = signal(1);

  readonly services = signal<ServiceDto[]>([]);
  readonly serviceLines = signal<DraftServiceLine[]>([]);
  readonly newLineServiceId = signal<number | null>(null);
  readonly newLineStaffId = signal<number | null>(null);
  readonly staffOptions = signal<StaffDto[]>([]);
  readonly loadingStaff = signal(false);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  constructor() {
    this.loadProducts();
    this.loadServices();
  }

  private loadProducts(): void {
    this.productService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.products.set(result.items));
  }

  private loadServices(): void {
    this.serviceService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.services.set(result.items));
  }

  get productsForCurrentEntreprise(): ProductDto[] {
    const entrepriseId = this.tenant.currentEntrepriseId();
    return this.products().filter((p) => p.entrepriseId === entrepriseId);
  }

  get servicesForCurrentEntreprise(): ServiceDto[] {
    const entrepriseId = this.tenant.currentEntrepriseId();
    return this.services().filter((s) => s.entrepriseId === entrepriseId);
  }

  productName(productId: number): string {
    return this.products().find((p) => p.id === productId)?.name ?? '';
  }

  onServiceSelected(serviceId: number | null): void {
    this.newLineServiceId.set(serviceId);
    this.newLineStaffId.set(null);
    this.staffOptions.set([]);
    if (!serviceId) return;

    this.loadingStaff.set(true);
    this.serviceService.getStaff(serviceId).subscribe({
      next: (staff) => {
        this.staffOptions.set(staff);
        this.loadingStaff.set(false);
      },
      error: () => {
        this.loadingStaff.set(false);
      }
    });
  }

  addServiceLine(): void {
    const serviceId = this.newLineServiceId();
    const staffId = this.newLineStaffId();
    if (!serviceId || !staffId) return;

    const serviceName = this.services().find((s) => s.id === serviceId)?.name ?? '';
    const staffName = this.staffOptions().find((s) => s.id === staffId)?.name ?? '';

    this.serviceLines.update((lines) => {
      if (lines.some((l) => l.serviceId === serviceId && l.staffId === staffId)) return lines;
      return [...lines, { serviceId, serviceName, staffId, staffName }];
    });

    this.newLineServiceId.set(null);
    this.newLineStaffId.set(null);
    this.staffOptions.set([]);
  }

  removeServiceLine(serviceId: number, staffId: number): void {
    this.serviceLines.update((lines) => lines.filter((l) => !(l.serviceId === serviceId && l.staffId === staffId)));
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
    if (!customer || !entrepriseId || (this.lines().length === 0 && this.serviceLines().length === 0)) return;

    this.submitting.set(true);
    this.submitError.set(null);

    this.orderService
      .createWalkIn({
        referenceCode: this.referenceCode().trim(),
        entrepriseId,
        lines: this.lines(),
        serviceLines: this.serviceLines().map((l) => ({ serviceId: l.serviceId, staffId: l.staffId }))
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.lines.set([]);
          this.serviceLines.set([]);
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
