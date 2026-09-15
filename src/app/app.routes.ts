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
    path: 'families',
    canActivate: [authGuard],
    loadComponent: () => import('./features/families/families').then((m) => m.Families)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders)
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservations/reservations').then((m) => m.Reservations)
  },
  {
    path: 'customer-returns',
    canActivate: [authGuard],
    loadComponent: () => import('./features/customer-returns/customer-returns').then((m) => m.CustomerReturns)
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
    path: 'stock-movements',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stock-movements/stock-movements').then((m) => m.StockMovements)
  },
  {
    path: 'stock-articles',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stock-articles/stock-articles').then((m) => m.StockArticles)
  },
  {
    path: 'suppliers',
    canActivate: [authGuard],
    loadComponent: () => import('./features/suppliers/suppliers').then((m) => m.Suppliers)
  },
  {
    path: 'subscription-plans',
    canActivate: [authGuard],
    loadComponent: () => import('./features/subscription-plans/subscription-plans').then((m) => m.SubscriptionPlans)
  },
  {
    path: 'entreprise-hours',
    canActivate: [authGuard],
    loadComponent: () => import('./features/entreprise-hours/entreprise-hours').then((m) => m.EntrepriseHours)
  },
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/attendance/attendance').then((m) => m.Attendance)
  },
  {
    path: 'payroll-config',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payroll-config/payroll-config').then((m) => m.PayrollConfig)
  },
  {
    path: 'payroll',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payroll/payroll').then((m) => m.Payroll)
  },
  {
    path: 'payroll/staff/:staffId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payroll/staff-history/staff-history').then((m) => m.StaffHistory)
  },
  {
    path: 'my-wallet',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-wallet/my-wallet').then((m) => m.MyWallet)
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-reservations/my-reservations').then((m) => m.MyReservations)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications').then((m) => m.Notifications)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./features/chat/chat').then((m) => m.Chat)
  },
  {
    path: 'loyalty-award',
    canActivate: [authGuard],
    loadComponent: () => import('./features/loyalty-award/loyalty-award').then((m) => m.LoyaltyAward)
  },
  {
    path: 'chat-settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/chat-settings/chat-settings').then((m) => m.ChatSettings)
  },
  {
    path: 'loyalty-config',
    canActivate: [authGuard],
    loadComponent: () => import('./features/loyalty-config/loyalty-config').then((m) => m.LoyaltyConfig)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account').then((m) => m.Account)
  },
  { path: '**', redirectTo: 'dashboard' }
];
