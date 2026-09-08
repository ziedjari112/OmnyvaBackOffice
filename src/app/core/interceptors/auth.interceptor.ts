import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TenantService } from '../services/tenant.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);

  const token = authService.accessToken();
  const entrepriseId = tenantService.currentEntrepriseId();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (entrepriseId != null) headers['X-Entreprise-Id'] = String(entrepriseId);

  const authedReq = Object.keys(headers).length > 0 ? req.clone({ setHeaders: headers }) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint && authService.getRefreshToken()) {
        return authService.refresh().pipe(
          switchMap(() => {
            const retryHeaders: Record<string, string> = { Authorization: `Bearer ${authService.accessToken()}` };
            if (entrepriseId != null) retryHeaders['X-Entreprise-Id'] = String(entrepriseId);
            return next(req.clone({ setHeaders: retryHeaders }));
          }),
          catchError((refreshError: unknown) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
