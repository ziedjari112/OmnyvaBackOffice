import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../core/services/payroll.service';
import { TenantService } from '../../core/services/tenant.service';
import { MyPayrollDto } from '../../core/models/payroll.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../core/pipes/money.pipe';

@Component({
  selector: 'app-my-wallet',
  standalone: true,
  imports: [FormsModule, TranslatePipe, MoneyPipe, DatePipe],
  templateUrl: './my-wallet.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class MyWallet {
  private readonly payrollService = inject(PayrollService);
  protected readonly tenant = inject(TenantService);

  readonly from = signal<string | null>(null);
  readonly to = signal<string | null>(null);
  readonly payroll = signal<MyPayrollDto | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  onFromChange(value: string): void {
    this.from.set(value || null);
    this.load();
  }

  onToChange(value: string): void {
    this.to.set(value || null);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.payrollService.getMine(this.from(), this.to()).subscribe({
      next: (payroll) => {
        this.payroll.set(payroll);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
