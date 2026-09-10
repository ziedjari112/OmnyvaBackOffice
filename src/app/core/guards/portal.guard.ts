import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Keeps a customer (client-portal) session out of the staff back-office routes — defense in depth on
 * top of the server already issuing a client session narrower permissions. Redirects to the client's
 * own landing page instead of leaving them on a route meant for staff. */
export const staffOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.portal() !== 'client') return true;

  router.navigate(['/my-loyalty']);
  return false;
};
