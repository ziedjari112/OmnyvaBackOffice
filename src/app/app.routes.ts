import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { staffOnlyGuard } from './core/guards/portal.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'client-login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/client-login/client-login').then((m) => m.ClientLogin)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'entreprises',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/entreprises/entreprises').then((m) => m.Entreprises)
  },
  {
    path: 'staff',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/staff/staff').then((m) => m.Staff)
  },
  {
    path: 'products',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/products/products').then((m) => m.Products)
  },
  {
    path: 'services',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/services/services').then((m) => m.Services)
  },
  {
    path: 'families',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/families/families').then((m) => m.Families)
  },
  {
    path: 'orders',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders)
  },
  {
    path: 'reservations',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/reservations/reservations').then((m) => m.Reservations)
  },
  {
    path: 'users',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/users/users').then((m) => m.Users)
  },
  {
    path: 'roles',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/roles/roles').then((m) => m.Roles)
  },
  {
    path: 'permissions',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/permissions/permissions').then((m) => m.Permissions)
  },
  {
    path: 'menus',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/menus/menus').then((m) => m.Menus)
  },
  {
    path: 'stock-movements',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/stock-movements/stock-movements').then((m) => m.StockMovements)
  },
  {
    path: 'suppliers',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/suppliers/suppliers').then((m) => m.Suppliers)
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/my-reservations/my-reservations').then((m) => m.MyReservations)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications').then((m) => m.Notifications)
  },
  {
    path: 'my-loyalty',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-loyalty/my-loyalty').then((m) => m.MyLoyalty)
  },
  {
    path: 'loyalty-award',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/loyalty-award/loyalty-award').then((m) => m.LoyaltyAward)
  },
  {
    path: 'loyalty-config',
    canActivate: [authGuard, staffOnlyGuard],
    loadComponent: () => import('./features/loyalty-config/loyalty-config').then((m) => m.LoyaltyConfig)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account').then((m) => m.Account)
  },
  { path: '**', redirectTo: 'dashboard' }
];
