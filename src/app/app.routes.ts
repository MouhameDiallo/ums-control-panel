import { Routes } from '@angular/router';
import {MainLayout} from './shared/components/main-layout/main-layout';
import {Login} from './features/auth/login/login';
import {adminGuard, authGuard} from './core/auth/auth-guard';


export const routes: Routes = [
  // 1. Routes d'Authentification (sans Sidebar)
  {
    path: 'login',
    component: Login
  },

  // 2. Routes Protégées (avec Sidebar/MainLayout)
  {
    path: '', // Ceci est le chemin de base (ex: /events, /admin/...)
    component: MainLayout, // Le composant de layout est le parent
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboards',
        pathMatch: 'full'
      },
      {
        path: 'events',
        loadChildren: () => import('./features/event-management/event.routes').then(m => m.EventRoutes)
      },
      {
        path: 'dashboards',
        loadChildren: () => import('./features/dashboards/dashboard.routes').then(m => m.DashboardRoutes)
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/user-management/user.routes').then(m => m.UserRoutes)
      },
      {
        path: 'admin/notifications',
        loadChildren: () => import('./features/push-notifications/notification.routes').then(m => m.NotificationRoutes)
      },
      {
        path: 'admin/lieux',
        loadChildren: () => import('./features/place-management/place.routes').then(m => m.PlaceRoutes)
      },
      // ... autres routes (profile, settings)
    ]
  },

  // 3. Route 404
  // { path: '**', component: NotFoundComponent }
];
