import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubscriptionPlanService } from '../../core/services/subscription-plan.service';
import { I18nService } from '../../core/services/i18n.service';
import { SubscriptionPlanDto, SubscriptionPlanUpsertDto } from '../../core/models/subscription-plan.model';
import { BusinessType } from '../../core/models/entreprise.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../core/pipes/money.pipe';

const EMPTY_FORM: SubscriptionPlanUpsertDto = {
  name: '',
  businessType: 'ServiceBased',
  isTrial: false,
  price: 0
};

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MoneyPipe],
  templateUrl: './subscription-plans.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class SubscriptionPlans {
  private readonly planService = inject(SubscriptionPlanService);
  private readonly i18n = inject(I18nService);

  readonly businessTypes: BusinessType[] = ['ServiceBased', 'Retail', 'ServiceAndRetail'];

  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly loading = signal(true);
  readonly pageNumber = signal(1);
  readonly totalPages = signal(1);

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly form = signal<SubscriptionPlanUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.planService.getPaged({ pageNumber: this.pageNumber(), pageSize: 50 }).subscribe({
      next: (result) => {
        this.plans.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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
    this.showForm.set(true);
  }

  openEdit(plan: SubscriptionPlanDto): void {
    this.editingId.set(plan.id);
    this.form.set({
      name: plan.name,
      businessType: plan.businessType,
      isTrial: plan.isTrial,
      price: plan.price
    });
    this.error.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request = id ? this.planService.update(id, this.form()) : this.planService.create(this.form());

    request.subscribe({
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

  remove(plan: SubscriptionPlanDto): void {
    if (!confirm(`${this.i18n.t('common.confirmDelete')} (${plan.name})`)) return;
    this.planService.delete(plan.id).subscribe(() => this.load());
  }
}
