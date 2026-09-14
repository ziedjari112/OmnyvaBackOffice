import { Component, inject } from '@angular/core';
import { SubscriptionStatusService } from '../../../core/services/subscription-status.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-subscription-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './subscription-banner.html',
  styleUrl: './subscription-banner.scss'
})
export class SubscriptionBanner {
  protected readonly subscriptionStatus = inject(SubscriptionStatusService);
}
