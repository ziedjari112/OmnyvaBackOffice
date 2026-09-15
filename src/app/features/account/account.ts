import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { StaffService } from '../../core/services/staff.service';
import { UploadService } from '../../core/services/upload.service';
import { UserDto } from '../../core/models/auth.model';
import { StaffDto } from '../../core/models/staff.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmNewPassword: '' };

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './account.html',
  styleUrl: '../../shared/styles/crud-page.scss'
})
export class Account {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly staffService = inject(StaffService);
  protected readonly uploadService = inject(UploadService);

  readonly me = signal<UserDto | null>(null);
  readonly loading = signal(true);

  /** The Staff record linked to this account, if any — null for a pure admin/manager account that has
   * no staff profile, in which case there's nowhere to store a photo and the upload UI stays hidden. */
  readonly myStaff = signal<StaffDto | null>(null);

  readonly passwordForm = signal({ ...EMPTY_PASSWORD_FORM });
  readonly changingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);

  readonly uploadingPhoto = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.getMe().subscribe({
      next: (user) => {
        this.me.set(user);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.staffService.getMine().subscribe({
      next: (staff) => this.myStaff.set(staff),
      error: () => this.myStaff.set(null) // 404 — this account isn't linked to a staff member
    });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.myStaff()) return;

    this.uploadingPhoto.set(true);
    this.uploadService.uploadImage(file, 'staff').subscribe({
      next: (url) => {
        this.staffService.updateMyPhoto(url).subscribe({
          next: (updated) => {
            this.myStaff.set(updated);
            this.uploadingPhoto.set(false);
          },
          error: () => this.uploadingPhoto.set(false)
        });
      },
      error: () => this.uploadingPhoto.set(false)
    });
  }

  updatePasswordField(field: keyof typeof EMPTY_PASSWORD_FORM, value: string): void {
    this.passwordForm.update((f) => ({ ...f, [field]: value }));
    this.passwordSuccess.set(false);
  }

  changePassword(): void {
    const form = this.passwordForm();
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    if (form.newPassword !== form.confirmNewPassword) {
      this.passwordError.set('account.password.mismatch');
      return;
    }

    this.changingPassword.set(true);
    this.userService.changeMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSuccess.set(true);
        this.passwordForm.set({ ...EMPTY_PASSWORD_FORM });
      },
      error: () => {
        this.changingPassword.set(false);
        this.passwordError.set('account.password.error');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
