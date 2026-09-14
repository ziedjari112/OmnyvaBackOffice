import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionStatusService } from '../../../core/services/subscription-status.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MoneyPipe } from '../../../core/pipes/money.pipe';

@Component({
  selector: 'app-subscription-expired',
  standalone: true,
  imports: [TranslatePipe, MoneyPipe],
  templateUrl: './subscription-expired.html',
  styleUrl: './subscription-expired.scss'
})
export class SubscriptionExpired {
  protected readonly auth = inject(AuthService);
  protected readonly subscriptionStatus = inject(SubscriptionStatusService);
}
