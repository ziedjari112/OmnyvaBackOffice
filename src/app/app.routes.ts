import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.Login) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'companies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/companies/companies').then((m) => m.Companies)
  },
  {
    path: 'franchises',
    canActivate: [authGuard],
    loadComponent: () => import('./features/franchises/franchises').then((m) => m.Franchises)
  },
  { path: '**', redirectTo: 'dashboard' }
];
