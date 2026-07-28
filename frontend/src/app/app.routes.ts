import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./public/calendar/calendar.component').then((m) => m.CalendarComponent),
  },
  {
    path: 'menu',
    loadComponent: () => import('./public/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./admin/gallery/gallery.component').then((m) => m.GalleryComponent),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./admin/reviews/reviews.component').then((m) => m.ReviewsComponent),
      },
      {
        path: 'inquiries',
        loadComponent: () => import('./admin/inquiries/inquiries.component').then((m) => m.InquiriesComponent),
      },
      {
        path: 'menus',
        loadComponent: () => import('./admin/menus/menus.component').then((m) => m.MenusComponent),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('./admin/availability/availability.component').then((m) => m.AvailabilityComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
