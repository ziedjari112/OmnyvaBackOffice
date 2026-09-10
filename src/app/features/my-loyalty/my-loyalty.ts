import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { MyLoyaltyPointsDto } from '../../core/models/loyalty.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-my-loyalty',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './my-loyalty.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class MyLoyalty implements OnDestroy {
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly points = signal<MyLoyaltyPointsDto[]>([]);
  readonly loading = signal(true);
  readonly qrUrl = signal<SafeUrl | null>(null);
  readonly loadingQr = signal(true);

  private objectUrl: string | null = null;

  constructor() {
    this.loyaltyService.getMine().subscribe({
      next: (result) => {
        this.points.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.loyaltyService.getMyQrCode().subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.qrUrl.set(this.sanitizer.bypassSecurityTrustUrl(this.objectUrl));
        this.loadingQr.set(false);
      },
      error: () => this.loadingQr.set(false)
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}
