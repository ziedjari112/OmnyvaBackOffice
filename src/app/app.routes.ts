import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'entreprises',
    canActivate: [authGuard],
    loadComponent: () => import('./features/entreprises/entreprises').then((m) => m.Entreprises)
  },
  {
    path: 'staff',
    canActivate: [authGuard],
    loadComponent: () => import('./features/staff/staff').then((m) => m.Staff)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/products').then((m) => m.Products)
  },
  {
    path: 'services',
    canActivate: [authGuard],
    loadComponent: () => import('./features/services/services').then((m) => m.Services)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users').then((m) => m.Users)
  },
  {
    path: 'roles',
    canActivate: [authGuard],
    loadComponent: () => import('./features/roles/roles').then((m) => m.Roles)
  },
  {
    path: 'permissions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/permissions/permissions').then((m) => m.Permissions)
  },
  {
    path: 'menus',
    canActivate: [authGuard],
    loadComponent: () => import('./features/menus/menus').then((m) => m.Menus)
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-reservations/my-reservations').then((m) => m.MyReservations)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account').then((m) => m.Account)
  },
  { path: '**', redirectTo: 'dashboard' }
];
