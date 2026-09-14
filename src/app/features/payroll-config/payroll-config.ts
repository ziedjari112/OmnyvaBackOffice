import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../core/services/payroll.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-payroll-config',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './payroll-config.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class PayrollConfig {
  private readonly payrollService = inject(PayrollService);

  readonly loading = signal(true);
  readonly staffPercentage = signal(0);
  readonly saving = signal(false);
  readonly saved = signal(false);

  readonly entreprisePercentage = computed(() => 100 - this.staffPercentage());

  constructor() {
    this.payrollService.getConfig().subscribe({
      next: (config) => {
        this.staffPercentage.set(config.hasConfig ? config.staffPercentage : 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPercentageChange(value: number): void {
    this.staffPercentage.set(Math.min(100, Math.max(0, value)));
    this.saved.set(false);
  }

  save(): void {
    this.saving.set(true);
    this.payrollService.setConfig({ staffPercentage: this.staffPercentage() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => this.saving.set(false)
    });
  }
}
