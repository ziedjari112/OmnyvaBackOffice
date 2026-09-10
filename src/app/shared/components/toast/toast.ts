import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  open(id: number): void {
    this.toastService.dismiss(id);
    this.router.navigate(['/notifications']);
  }

  dismiss(id: number, event: Event): void {
    event.stopPropagation();
    this.toastService.dismiss(id);
  }
}
