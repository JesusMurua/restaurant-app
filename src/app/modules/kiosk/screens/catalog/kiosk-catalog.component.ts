import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../../../pos/data/pos.fixture';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-kiosk-catalog',
  standalone: true,
  imports: [PricePipe],
  templateUrl: './kiosk-catalog.component.html',
  styleUrl: './kiosk-catalog.component.scss',
})
export class KioskCatalogComponent implements OnInit {

  //#region Properties

  readonly isLoading       = this.productService.isLoading;
  readonly categories      = this.productService.categories;
  readonly selectedCategoryId = this.productService.selectedCategoryId;
  readonly filteredProducts   = this.productService.filteredProducts;

  /** Reactive item count from CartService */
  readonly cartItemCount = this.cartService.itemCount;

  //#endregion

  //#region Constructor
  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly router: Router,
  ) {}
  //#endregion

  //#region Lifecycle

  async ngOnInit(): Promise<void> {
    await this.productService.loadCatalog();

    if (this.productService.products().length === 0) {
      await this.productService.seedCatalog(SEED_PRODUCTS, SEED_CATEGORIES);
    }
  }

  //#endregion

  //#region Category filter

  selectCategory(id: number | null): void {
    this.productService.selectCategory(id);
  }

  //#endregion

  //#region Product selection

  async onProductTapped(product: Product): Promise<void> {
    // Products with sizes or extras require the detail screen for customization.
    // Products without any customization options are added directly to the cart
    // for a faster self-service experience.
    const hasCustomization = product.sizes.length > 0 || product.extras.length > 0;

    if (hasCustomization) {
      this.router.navigate(['/kiosk/detail', product.id]);
    } else {
      await this.cartService.addItem(product);
    }
  }

  //#endregion

  //#region Navigation

  goToSummary(): void {
    this.router.navigate(['/kiosk/summary']);
  }

  async cancelOrder(): Promise<void> {
    await this.cartService.clearCart();
    this.router.navigate(['/kiosk/welcome']);
  }

  //#endregion

}
