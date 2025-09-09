import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home').then(m => m.Home),
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login),
    }
];
