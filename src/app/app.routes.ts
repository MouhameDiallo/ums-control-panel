import { Routes } from '@angular/router';
import {MainLayout} from './shared/components/main-layout/main-layout';


export const routes: Routes = [
  // 1. Routes d'Authentification (sans Sidebar)
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  // },

  // 2. Routes Protégées (avec Sidebar/MainLayout)
  {
    path: '', // Ceci est le chemin de base (ex: /events, /admin/...)
    component: MainLayout, // Le composant de layout est le parent
    // Protéger ces routes ici avec AuthGuard
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      },
      {
        path: 'events',
        loadChildren: () => import('./features/event-management/event.routes').then(m => m.EventRoutes)
      },
      // {
      //   path: 'admin/users',
      //   loadChildren: () => import('./features/user-management/user-management.routes').then(m => m.USER_ROUTES)
      // },
      {
        path: 'admin/notifications',
        loadChildren: () => import('./features/push-notifications/notification.routes').then(m => m.NotificationRoutes)
      },
      // ... autres routes (profile, settings)
    ]
  },

  // 3. Route 404
  // { path: '**', component: NotFoundComponent }
];
