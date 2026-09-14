import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { I18nService } from '../../core/services/i18n.service';
import { TenantService } from '../../core/services/tenant.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { SubscriptionPlanService } from '../../core/services/subscription-plan.service';
import { CurrencyService } from '../../core/services/currency.service';
import { BusinessGender, BusinessType, EntrepriseDto, EntrepriseUpsertDto } from '../../core/models/entreprise.model';
import { SubscriptionStatusDto } from '../../core/models/subscription.model';
import { SubscriptionPlanDto } from '../../core/models/subscription-plan.model';
import { CurrencyDto } from '../../core/models/currency.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../core/pipes/money.pipe';

const EMPTY_FORM: EntrepriseUpsertDto = {
  name: '',
  description: null,
  address: null,
  city: null,
  phone: null,
  email: null,
  latitude: null,
  longitude: null,
  businessType: 'ServiceBased',
  gender: null,
  matriculeFiscal: '',
  registerCommerceNumber: null,
  legalForm: null,
  website: null,
  logoUrl: null,
  currency: 'TND',
  adminName: '',
  adminEmail: '',
  subscriptionPlanId: null,
  subscriptionStartDate: null,
  subscriptionEndDate: null,
  subscriptionDiscountPercentage: 0
};

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MoneyPipe],
  templateUrl: './entreprises.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Entreprises {
  private readonly entrepriseService = inject(EntrepriseService);
  private readonly i18n = inject(I18nService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly subscriptionPlanService = inject(SubscriptionPlanService);
  private readonly currencyService = inject(CurrencyService);
  protected readonly tenant = inject(TenantService);

  readonly currencies = signal<CurrencyDto[]>([]);

  readonly businessTypes: BusinessType[] = ['ServiceBased', 'Retail', 'ServiceAndRetail'];
  readonly genders: BusinessGender[] = ['Female', 'Male', 'Unisex'];

  readonly entreprises = signal<EntrepriseDto[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<EntrepriseUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Edit-mode subscription sub-form — independent of the main form/submit(), same pattern as the staff
  // working-hours sub-form: its own state, its own save button, its own PUT.
  readonly subscriptionStatus = signal<SubscriptionStatusDto | null>(null);
  readonly subscriptionForm = signal<{ planId: number | null; startDate: string; endDate: string; discountPercentage: number }>({
    planId: null,
    startDate: '',
    endDate: '',
    discountPercentage: 0
  });
  readonly subscriptionSaving = signal(false);
  readonly subscriptionSaved = signal(false);

  readonly plans = signal<SubscriptionPlanDto[]>([]);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.currencyService.getAll().subscribe((currencies) => this.currencies.set(currencies));
    if (this.tenant.hasGlobalRole()) {
      this.subscriptionPlanService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((result) => this.plans.set(result.items));
    }
  }

  plansForBusinessType(businessType: BusinessType): SubscriptionPlanDto[] {
    return this.plans().filter((p) => p.businessType === businessType);
  }

  load(): void {
    this.loading.set(true);
    this.entrepriseService
      .getPaged({ pageNumber: this.pageNumber(), pageSize: 20, searchTerm: this.searchTerm() || undefined })
      .subscribe({
        next: (result) => {
          this.entreprises.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
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
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.subscriptionStatus.set(null);
    this.subscriptionForm.set({ planId: null, startDate: '', endDate: '', discountPercentage: 0 });
    this.subscriptionSaved.set(false);
    this.showForm.set(true);
  }

  openEdit(entreprise: EntrepriseDto): void {
    this.editingId.set(entreprise.id);
    this.form.set({
      name: entreprise.name,
      description: entreprise.description,
      address: entreprise.address,
      city: entreprise.city,
      phone: entreprise.phone,
      email: entreprise.email,
      latitude: entreprise.latitude,
      longitude: entreprise.longitude,
      businessType: entreprise.businessType,
      gender: entreprise.gender,
      matriculeFiscal: entreprise.matriculeFiscal,
      registerCommerceNumber: entreprise.registerCommerceNumber,
      legalForm: entreprise.legalForm,
      website: entreprise.website,
      logoUrl: entreprise.logoUrl,
      currency: entreprise.currency,
      adminName: '',
      adminEmail: '',
      subscriptionPlanId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      subscriptionDiscountPercentage: 0
    });
    this.error.set(null);
    this.showForm.set(true);

    if (this.tenant.hasGlobalRole()) {
      this.subscriptionStatus.set(null);
      this.subscriptionSaved.set(false);
      this.subscriptionService.get(entreprise.id).subscribe((status) => {
        this.subscriptionStatus.set(status);
        this.subscriptionForm.set({
          planId: status.planId ?? null,
          startDate: status.startDate ?? '',
          endDate: status.endDate ?? '',
          discountPercentage: status.discountPercentage ?? 0
        });
      });
    }
  }

  saveSubscription(): void {
    const id = this.editingId();
    const form = this.subscriptionForm();
    if (!id || !form.planId || !form.startDate || !form.endDate) return;

    this.subscriptionSaving.set(true);
    this.subscriptionSaved.set(false);
    this.subscriptionService
      .set(id, {
        planId: form.planId,
        startDate: form.startDate,
        endDate: form.endDate,
        discountPercentage: form.discountPercentage
      })
      .subscribe({
        next: (status) => {
          this.subscriptionStatus.set(status);
          this.subscriptionSaving.set(false);
          this.subscriptionSaved.set(true);
        },
        error: () => this.subscriptionSaving.set(false)
      });
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onBusinessTypeChange(value: BusinessType): void {
    const needsGender = value === 'ServiceBased' || value === 'ServiceAndRetail';
    this.form.update((f) => ({ ...f, businessType: value, gender: needsGender ? (f.gender ?? 'Unisex') : null }));
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();

    if (id) {
      this.entrepriseService.update(id, this.form()).subscribe({
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
      return;
    }

    this.entrepriseService.create(this.form()).subscribe({
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

  remove(entreprise: EntrepriseDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${entreprise.name})`)) return;
    this.entrepriseService.delete(entreprise.id).subscribe(() => this.load());
  }
}
