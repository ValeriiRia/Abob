import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; // Убедитесь, что этот импорт на месте

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/portfolio/portfolio-list/portfolio-list.component').then(m => m.PortfolioListComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./features/admin/portfolio-admin/portfolio-admin.component').then(m => m.PortfolioAdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    //
    // --- ВОТ ИСПРАВЛЕНИЕ ---
    // Убедитесь, что путь.then(m => m.LoginComponent)
    //
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  }
];