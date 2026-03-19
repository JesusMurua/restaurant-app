import { Routes } from '@angular/router';

import { pinGuard } from './core/guards/pin.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full',
  },
  {
    path: 'pos',
    loadChildren: () =>
      import('./modules/pos/pos.routes').then(m => m.posRoutes),
  },
  {
    path: 'pin',
    loadComponent: () =>
      import('./modules/pin/pin.component').then(m => m.PinComponent),
  },
  {
    path: 'admin',
    canActivate: [pinGuard],
    loadChildren: () =>
      import('./modules/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'kiosk',
    loadChildren: () =>
      import('./modules/kiosk/kiosk.routes').then(m => m.kioskRoutes),
  },
  {
    path: '**',
    redirectTo: 'pos',
  },
];
