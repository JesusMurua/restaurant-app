import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [PricePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {

  //#region Inputs & Outputs
  @Input({ required: true }) product!: Product;
  @Output() selected = new EventEmitter<Product>();
  //#endregion

}
