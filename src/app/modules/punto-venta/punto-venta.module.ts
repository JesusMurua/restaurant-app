import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PuntoVentaRoutingModule } from './punto-venta-routing.module';
import { PuntoVentaComponent } from './components/punto-venta/punto-venta.component';
import { PlatilloDetailComponent } from './components/platillo-detail/platillo-detail.component';
import { PlatilloComponent } from './components/platillo/platillo.component'


import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { PlatillosComponent } from './components/platillos/platillos.component';
import { SharedModule } from '../../shared/shared.module'
import { MaterialModule } from '../material/material.module'
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    PuntoVentaComponent,
    PlatillosComponent,
    PlatilloComponent,
    PlatilloDetailComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FlexLayoutModule,
    PuntoVentaRoutingModule,
    NumericTextBoxModule
  ]
})
export class PuntoVentaModule { }
