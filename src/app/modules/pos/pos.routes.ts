import { Routes } from '@angular/router';

export const posRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/product-grid/product-grid.component')
        .then(m => m.ProductGridComponent),
  },
  {
    path: 'add-meal/:id',
    loadComponent: () =>
      import('./components/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component')
        .then(m => m.CheckoutComponent),
  },
];
