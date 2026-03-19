import { Routes } from '@angular/router';

export const kioskRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./kiosk-shell.component').then(m => m.KioskShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('./screens/welcome/kiosk-welcome.component')
            .then(m => m.KioskWelcomeComponent),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./screens/catalog/kiosk-catalog.component')
            .then(m => m.KioskCatalogComponent),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./screens/detail/kiosk-detail.component')
            .then(m => m.KioskDetailComponent),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./screens/summary/kiosk-summary.component')
            .then(m => m.KioskSummaryComponent),
      },
      {
        path: 'ticket',
        loadComponent: () =>
          import('./screens/ticket/kiosk-ticket.component')
            .then(m => m.KioskTicketComponent),
      },
    ],
  },
];
