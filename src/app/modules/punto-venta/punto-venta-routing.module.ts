import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PuntoVentaComponent } from './components/punto-venta/punto-venta.component';
import { PlatilloDetailComponent } from './components/platillo-detail/platillo-detail.component';


const routes: Routes = [
  {
		path: '',
    component: PuntoVentaComponent,
    // children: [
    //   {
    //     path: 'add-meal/:id',
    //     component: PlatilloDetailComponent
    //   }
    // ]
  },
  {
    path: 'add-meal/:id',
    component: PlatilloDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuntoVentaRoutingModule { }
