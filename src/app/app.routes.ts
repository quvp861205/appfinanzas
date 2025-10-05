import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'gastos',
        loadComponent: () => import('./gastos/gastos.component').then(m => m.MovimientosComponent),
        canActivate: [authGuard]
    },
    {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.HomeComponent)
    }
];
