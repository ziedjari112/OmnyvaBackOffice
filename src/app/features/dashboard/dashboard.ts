import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { StaffService } from '../../core/services/staff.service';
import { ProductService } from '../../core/services/product.service';
import { ServiceService } from '../../core/services/service.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly staffService = inject(StaffService);
  private readonly productService = inject(ProductService);
  private readonly serviceService = inject(ServiceService);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  // Independent per-tile signals, not one combined object — a role that lacks permission for one of these
  // (e.g. Staff has none of Staff.Read/Products.Read/Services.Read) must not blank out the whole dashboard
  // just because that one request 403s; that tile is simply omitted instead.
  protected readonly entreprisesCount = signal<number | null>(null);
  protected readonly staffCount = signal<number | null>(null);
  protected readonly productsCount = signal<number | null>(null);
  protected readonly servicesCount = signal<number | null>(null);

  constructor() {
    this.entrepriseService.getMine().subscribe({
      next: (entreprises) => this.entreprisesCount.set(entreprises.length),
      error: () => this.entreprisesCount.set(null)
    });
    this.staffService.getPaged({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => this.staffCount.set(result.totalCount),
      error: () => this.staffCount.set(null)
    });
    this.productService.getPaged({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => this.productsCount.set(result.totalCount),
      error: () => this.productsCount.set(null)
    });
    this.serviceService.getPaged({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => this.servicesCount.set(result.totalCount),
      error: () => this.servicesCount.set(null)
    });
  }
}
