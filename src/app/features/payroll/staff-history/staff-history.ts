import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { TenantService } from '../../../core/services/tenant.service';
import { PayrollTransactionDto } from '../../../core/models/payroll.model';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../../core/pipes/money.pipe';

@Component({
  selector: 'app-staff-history',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, MoneyPipe, DatePipe],
  templateUrl: './staff-history.html',
  styleUrl: '../../../shared/styles/crud-page.scss'
})
export class StaffHistory {
  private readonly route = inject(ActivatedRoute);
  private readonly payrollService = inject(PayrollService);
  protected readonly tenant = inject(TenantService);

  readonly staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  readonly from = signal<string | null>(null);
  readonly to = signal<string | null>(null);
  readonly transactions = signal<PayrollTransactionDto[]>([]);
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
    this.payrollService.getStaffHistory(this.staffId, this.from(), this.to()).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
