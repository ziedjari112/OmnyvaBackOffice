import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: number;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);
  private nextId = 1;

  show(title: string, message: string): void {
    const id = this.nextId++;
    this.toasts.update((items) => [...items, { id, title, message }]);
    setTimeout(() => this.dismiss(id), 6000);
  }

  dismiss(id: number): void {
    this.toasts.update((items) => items.filter((t) => t.id !== id));
  }
}
