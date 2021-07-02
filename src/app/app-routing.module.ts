import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';


const routes: Routes = [
  { path: '', redirectTo: 'punto-venta', data: { title: 'restaurant-app' }, pathMatch: 'full' },
  { path: 'punto-venta', loadChildren: () => import('./modules/punto-venta/punto-venta.module').then(m => m.PuntoVentaModule) },
  // { path: 'add-meal/:id',  loadChildren: () => import('./modules/punto-venta/punto-venta.module').then(m => m.PuntoVentaModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
