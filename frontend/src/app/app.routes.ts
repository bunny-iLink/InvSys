import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        title: 'Home | InvSys',
        loadComponent: () => import('./components/home/home').then(m => m.Home),
    },
    {
        path: 'login',
        title: 'Login | InvSys',
        loadComponent: () => import('./components/login/login').then(m => m.Login),
    },
    {
        path: 'register',
        title: 'Register | InvSys',
        loadComponent: () => import('./components/register/register').then(m => m.Register),
    },
    {
        path: 'dashboard',
        title: 'Dashboard | InvSys',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    },
    {
        path: 'verify',
        title: 'Verify Account | InvSys',
        loadComponent: () => import('./components/verify/verify').then(m => m.Verify),
    },
];
