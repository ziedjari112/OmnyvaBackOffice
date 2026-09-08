import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { I18nService } from '../../../core/services/i18n.service';
import { MenuService } from '../../../core/services/menu.service';
import { FranchiseService } from '../../../core/services/franchise.service';
import { Locale } from '../../../core/i18n/translations';
import { MenuDto } from '../../../core/models/menu.model';
import { FranchiseDto } from '../../../core/models/franchise.model';
import { FilterType } from '../../../core/models/pagination.model';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly tenant = inject(TenantService);
  protected readonly i18n = inject(I18nService);
  private readonly menuService = inject(MenuService);
  private readonly franchiseService = inject(FranchiseService);

  protected readonly locales: Locale[] = ['en', 'fr', 'ar'];
  protected readonly menuItems = signal<MenuDto[]>([]);
  protected readonly availableFranchises = signal<FranchiseDto[]>([]);

  protected readonly franchiseSelectValue = computed(() => this.tenant.currentFranchiseId()?.toString() ?? '');

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.menuService.getMine().subscribe((items) => this.menuItems.set(items));
      }
    });

    effect(() => {
      const ids = this.tenant.availableFranchiseIds();
      if (ids.length === 0) {
        this.availableFranchises.set([]);
        return;
      }
      this.franchiseService
        .getPaged({
          pageNumber: 1,
          pageSize: ids.length,
          filters: [{ propertyName: 'Id', values: ids.map(String), type: FilterType.Equals }]
        })
        .subscribe((result) => this.availableFranchises.set(result.items));
    });
  }

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }

  onFranchiseChange(value: string): void {
    this.tenant.setFranchise(value ? Number(value) : null);
    location.reload();
  }
}
