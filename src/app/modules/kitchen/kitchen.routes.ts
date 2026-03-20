import { Routes } from '@angular/router';

export const kitchenRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./kitchen-display.component').then(m => m.KitchenDisplayComponent),
  },
];
