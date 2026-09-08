import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
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

  protected readonly counts = signal<{ entreprises: number; staff: number; products: number; services: number } | null>(null);

  constructor() {
    forkJoin({
      entreprises: this.entrepriseService.getPaged({ pageNumber: 1, pageSize: 1 }),
      staff: this.staffService.getPaged({ pageNumber: 1, pageSize: 1 }),
      products: this.productService.getPaged({ pageNumber: 1, pageSize: 1 }),
      services: this.serviceService.getPaged({ pageNumber: 1, pageSize: 1 })
    }).subscribe(({ entreprises, staff, products, services }) => {
      this.counts.set({
        entreprises: entreprises.totalCount,
        staff: staff.totalCount,
        products: products.totalCount,
        services: services.totalCount
      });
    });
  }
}
