import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PayrollService } from '../../core/services/payroll.service';
import { TenantService } from '../../core/services/tenant.service';
import { PayrollSummaryDto } from '../../core/models/payroll.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../core/pipes/money.pipe';

function firstDayOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, MoneyPipe],
  templateUrl: './payroll.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Payroll {
  private readonly payrollService = inject(PayrollService);
  protected readonly tenant = inject(TenantService);

  readonly from = signal(firstDayOfMonthIso());
  readonly to = signal(todayIso());
  readonly summary = signal<PayrollSummaryDto | null>(null);
  readonly loading = signal(true);
  readonly settlingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  onFromChange(value: string): void {
    this.from.set(value);
    this.load();
  }

  onToChange(value: string): void {
    this.to.set(value);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.payrollService.getSummary(this.from(), this.to()).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  settle(staffId: number): void {
    this.settlingId.set(staffId);
    this.payrollService.settle(staffId).subscribe({
      next: () => {
        this.settlingId.set(null);
        this.load();
      },
      error: () => this.settlingId.set(null)
    });
  }
}
