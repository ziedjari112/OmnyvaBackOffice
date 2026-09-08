import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { I18nService } from '../../../core/services/i18n.service';
import { MenuService } from '../../../core/services/menu.service';
import { EntrepriseService } from '../../../core/services/entreprise.service';
import { Locale } from '../../../core/i18n/translations';
import { MenuDto } from '../../../core/models/menu.model';
import { EntrepriseDto } from '../../../core/models/entreprise.model';
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
  private readonly entrepriseService = inject(EntrepriseService);

  protected readonly locales: Locale[] = ['en', 'fr', 'ar'];
  protected readonly menuItems = signal<MenuDto[]>([]);
  protected readonly availableEntreprises = signal<EntrepriseDto[]>([]);

  protected readonly entrepriseSelectValue = computed(() => this.tenant.currentEntrepriseId()?.toString() ?? '');

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.menuService.getMine().subscribe((items) => this.menuItems.set(items));
      }
    });

    effect(() => {
      const ids = this.tenant.availableEntrepriseIds();
      if (ids.length === 0) {
        this.availableEntreprises.set([]);
        return;
      }
      this.entrepriseService
        .getPaged({
          pageNumber: 1,
          pageSize: ids.length,
          filters: [{ propertyName: 'Id', values: ids.map(String), type: FilterType.Equals }]
        })
        .subscribe((result) => this.availableEntreprises.set(result.items));
    });
  }

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }

  onEntrepriseChange(value: string): void {
    this.tenant.setEntreprise(value ? Number(value) : null);
    location.reload();
  }
}
