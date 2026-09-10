import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { LoyaltyConfigUpsertDto, LoyaltyExpirationPolicy } from '../../core/models/loyalty.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_FORM: LoyaltyConfigUpsertDto = {
  expirationPolicy: 'Never',
  expirationDays: 365
};

@Component({
  selector: 'app-loyalty-config',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './loyalty-config.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class LoyaltyConfig {
  private readonly loyaltyService = inject(LoyaltyService);

  readonly policies: LoyaltyExpirationPolicy[] = ['Never', 'FixedDays', 'EndOfYear'];

  readonly loading = signal(true);
  readonly form = signal<LoyaltyConfigUpsertDto>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loyaltyService.getConfig().subscribe({
      next: (config) => {
        this.form.set({ expirationPolicy: config.expirationPolicy, expirationDays: config.expirationDays });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

    this.loyaltyService.updateConfig(this.form()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('common.error.generic');
      }
    });
  }
}
