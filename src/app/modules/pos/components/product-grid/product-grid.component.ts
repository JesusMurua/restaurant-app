import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Product } from '../../../../core/models';
import { ProductService } from '../../../../core/services/product.service';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../../data/pos.fixture';
import { CartPanelComponent } from '../cart-panel/cart-panel.component';
import { PosHeaderComponent } from '../pos-header/pos-header.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    ProductCardComponent,
    CartPanelComponent,
    PosHeaderComponent,
  ],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.scss',
})
export class ProductGridComponent implements OnInit {

  //#region Properties — exposed from service for template binding
  readonly isLoading = this.productService.isLoading;
  readonly categories = this.productService.categories;
  readonly filteredProducts = this.productService.filteredProducts;
  readonly selectedCategoryId = this.productService.selectedCategoryId;
  //#endregion

  //#region Constructor
  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
  ) {}
  //#endregion

  //#region Lifecycle
  async ngOnInit(): Promise<void> {
    await this.productService.loadCatalog();

    // Seed local DB if empty (no backend available yet)
    if (this.productService.products().length === 0) {
      await this.productService.seedCatalog(SEED_PRODUCTS, SEED_CATEGORIES);
    }
  }
  //#endregion

  //#region Category Methods

  /**
   * Sets the active category filter.
   * Passing null shows all available products.
   */
  selectCategory(id: number | null): void {
    this.productService.selectCategory(id);
  }
  //#endregion

  //#region Product Methods

  /**
   * Navigates to the product detail page for customization.
   * Products without sizes or extras are added directly to the cart.
   */
  onProductSelected(product: Product): void {
    const hasOptions = product.sizes.length > 0 || product.extras.length > 0;

    if (hasOptions) {
      this.router.navigate(['/pos/add-meal', product.id]);
    } else {
      this.router.navigate(['/pos/add-meal', product.id]);
    }
  }
  //#endregion

}
