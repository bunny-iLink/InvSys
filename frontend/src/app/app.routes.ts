import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';

export const routes: Routes = [
  {
    path: '',
    title: 'Home | InvSys',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Login | InvSys',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Register | InvSys',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'verify',
    title: 'Verify Account | InvSys',
    loadComponent: () =>
      import('./components/verify/verify').then((m) => m.Verify),
  },
  {
    path: 'profile',
    title: 'Profile | InvSys',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  {
    path: 'customer',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | InvSys',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        title: 'Products | InvSys',
        loadComponent: () =>
          import('./components/products/products').then((m) => m.Products),
      },
    ],
  },
  {
    path: 'admin',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | InvSys',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        title: 'Users | InvSys',
        loadComponent: () =>
          import('./components/users/users').then((m) => m.Users),
      },
      {
        path: 'products',
        title: 'Products | InvSys',
        loadComponent: () =>
          import('./components/products/products').then((m) => m.Products),
      },
    ],
  },
  {
    path: 'employee',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | InvSys',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        title: 'Products | InvSys',
        loadComponent: () =>
          import('./components/products/products').then((m) => m.Products),
      },
    ],
  },
];
