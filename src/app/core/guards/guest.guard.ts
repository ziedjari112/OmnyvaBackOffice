import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** The opposite of authGuard: keeps an already-authenticated user off the login page, sending them
 * straight to the dashboard instead of showing the form again. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return true;

  router.navigate([authService.portal() === 'client' ? '/my-loyalty' : '/dashboard']);
  return false;
};
