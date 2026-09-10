import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

// Matches Omnyva.Core.Services.AuthService.LoginClientAsync's rejection message exactly.
const NOT_AUTHORIZED_MESSAGE = 'This account does not have access to the client space.';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [FormsModule, TranslatePipe, RouterLink],
  templateUrl: './client-login.html',
  styleUrl: '../login/login.scss'
})
export class ClientLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auth.loginClient({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/my-loyalty']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const message = (err.error as { error?: string } | null)?.error;
        this.error.set(message === NOT_AUTHORIZED_MESSAGE ? 'auth.error.notAuthorizedClient' : 'auth.error.generic');
      }
    });
  }
}
