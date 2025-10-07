import { Routes } from '@angular/router';
import { Guard } from './guard/guard';
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
    canActivateChild: [Guard],
    data: { roles: ['customer'] },
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
      {
        path: 'orders',
        title: 'My Orders | InvSys',
        loadComponent: () =>
          import('./components/orders/orders').then((m) => m.Orders),
      },
    ],
  },
  {
    path: 'employee',
    canActivateChild: [Guard],
    data: { roles: ['employee'] },
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
      {
        path: 'purchaseorders',
        title: 'Purchases | InvSys',
        loadComponent: () =>
          import('./components/purchaseorders/purchaseorders').then(
            (m) => m.Purchaseorders
          ),
      },
      {
        path: 'sales',
        title: 'Sales | InvSys',
        loadComponent: () =>
          import('./components/orders/orders').then((m) => m.Orders),
      },
    ],
  },
  {
    path: 'admin',
    component: Layout,
    canActivateChild: [Guard],
    data: { roles: ['admin'] },
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
      {
        path: 'categories',
        title: 'Categories | InvSys',
        loadComponent: () =>
          import('./components/categories/categories').then(
            (m) => m.Categories
          ),
      },
      {
        path: 'purchaseorders',
        title: 'Purchases | InvSys',
        loadComponent: () =>
          import('./components/purchaseorders/purchaseorders').then(
            (m) => m.Purchaseorders
          ),
      },
      {
        path: 'sales',
        title: 'Sales | InvSys',
        loadComponent: () =>
          import('./components/orders/orders').then((m) => m.Orders),
      },
    ],
  },
  {
    path: 'superadmin',
    canActivateChild: [Guard],
    data: { roles: ['superadmin'] },
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
      {
        path: 'categories',
        title: 'Categories | InvSys',
        loadComponent: () =>
          import('./components/categories/categories').then(
            (m) => m.Categories
          ),
      },
      {
        path: 'purchaseorders',
        title: 'Purchases | InvSys',
        loadComponent: () =>
          import('./components/purchaseorders/purchaseorders').then(
            (m) => m.Purchaseorders
          ),
      },
      {
        path: 'sales',
        title: 'Sales | InvSys',
        loadComponent: () =>
          import('./components/orders/orders').then((m) => m.Orders),
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized').then(
        (m) => m.Unauthorized
      ),
    title: 'Unauthorized | JobHunt Pro',
  },
];
