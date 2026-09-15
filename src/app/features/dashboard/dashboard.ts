import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { StaffService } from '../../core/services/staff.service';
import { ProductService } from '../../core/services/product.service';
import { ServiceService } from '../../core/services/service.service';
import { OrderService } from '../../core/services/order.service';
import { UploadService } from '../../core/services/upload.service';
import { StaffDto } from '../../core/models/staff.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly staffService = inject(StaffService);
  private readonly productService = inject(ProductService);
  private readonly serviceService = inject(ServiceService);
  private readonly orderService = inject(OrderService);
  protected readonly uploadService = inject(UploadService);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  // The account's linked Staff record, if any — null for a pure admin/manager account, in which case
  // the avatar falls back to initials (same rule the Account page's photo upload already follows).
  protected readonly myStaff = signal<StaffDto | null>(null);

  // Independent per-tile signals, not one combined object — a role that lacks permission for one of these
  // (e.g. Staff has none of Staff.Read/Products.Read/Services.Read) must not blank out the whole dashboard
  // just because that one request 403s; that tile is simply omitted instead.
  protected readonly entreprisesCount = signal<number | null>(null);
  protected readonly staffCount = signal<number | null>(null);
  protected readonly productsCount = signal<number | null>(null);
  protected readonly servicesCount = signal<number | null>(null);
  protected readonly ordersCount = signal<number | null>(null);

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
    this.orderService.getPaged({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => this.ordersCount.set(result.totalCount),
      error: () => this.ordersCount.set(null)
    });
    this.staffService.getMine().subscribe({
      next: (staff) => this.myStaff.set(staff),
      error: () => this.myStaff.set(null)
    });
  }
}
