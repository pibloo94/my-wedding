import { Routes } from '@angular/router';

export interface NavItem { path: string; label: string; icon: string; }

export const NAV: NavItem[] = [
  { path: 'inicio', label: 'Inicio', icon: 'home' },
  { path: 'invitados', label: 'Invitados', icon: 'users' },
  { path: 'mesas', label: 'Mesas', icon: 'table' },
  { path: 'presupuesto', label: 'Presupuesto', icon: 'wallet' },
  { path: 'proveedores', label: 'Proveedores', icon: 'brief' },
  { path: 'tareas', label: 'Tareas', icon: 'check' },
  { path: 'tematica', label: 'Temática', icon: 'palette' },
  { path: 'web', label: 'Web de la boda', icon: 'globe' },
  { path: 'configuracion', label: 'Configuración', icon: 'gear' }
];

/** Secciones de la barra inferior en móvil (el resto, en «Más»). */
export const TABBAR = ['inicio', 'invitados', 'mesas', 'tareas'];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', title: 'Inicio', loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage) },
  { path: 'invitados', title: 'Invitados', loadComponent: () => import('./features/guests/guests.page').then(m => m.GuestsPage) },
  { path: 'mesas', title: 'Mesas', loadComponent: () => import('./features/tables/tables.page').then(m => m.TablesPage) },
  { path: 'presupuesto', title: 'Presupuesto', loadComponent: () => import('./features/budget/budget.page').then(m => m.BudgetPage) },
  { path: 'proveedores', title: 'Proveedores', loadComponent: () => import('./features/vendors/vendors.page').then(m => m.VendorsPage) },
  { path: 'tareas', title: 'Tareas', loadComponent: () => import('./features/tasks/tasks.page').then(m => m.TasksPage) },
  { path: 'tematica', title: 'Temática', loadComponent: () => import('./features/theme/theme.page').then(m => m.ThemePage) },
  { path: 'web', title: 'Web de la boda', loadComponent: () => import('./features/web/web.page').then(m => m.WebPage) },
  { path: 'web/:tab', title: 'Web de la boda', loadComponent: () => import('./features/web/web.page').then(m => m.WebPage) },
  { path: 'guia', title: 'Guía de configuración', loadComponent: () => import('./features/guide/guide.page').then(m => m.GuidePage) },
  { path: 'configuracion', title: 'Configuración', loadComponent: () => import('./features/settings/settings.page').then(m => m.SettingsPage) },
  { path: '**', redirectTo: 'inicio' }
];
