import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { StaffService } from '../../core/services/staff.service';
import { StaffDto } from '../../core/models/staff.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './chat-settings.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class ChatSettings {
  private readonly chatService = inject(ChatService);
  private readonly staffService = inject(StaffService);

  readonly staffWithLogin = signal<StaffDto[]>([]);
  readonly selectedUserIds = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);

  constructor() {
    this.staffService.getPaged({ pageNumber: 1, pageSize: 200 }).subscribe((staffResult) => {
      this.staffWithLogin.set(staffResult.items.filter((s) => s.userId != null));

      this.chatService.getRecipients().subscribe({
        next: (recipients) => {
          this.selectedUserIds.set(new Set(recipients.map((r) => r.userId)));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  isSelected(staff: StaffDto): boolean {
    return staff.userId != null && this.selectedUserIds().has(staff.userId);
  }

  toggle(staff: StaffDto): void {
    if (staff.userId == null) return;

    this.selectedUserIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(staff.userId!)) next.delete(staff.userId!);
      else next.add(staff.userId!);
      return next;
    });
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);

    this.chatService.setRecipients(Array.from(this.selectedUserIds())).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => this.saving.set(false)
    });
  }
}
