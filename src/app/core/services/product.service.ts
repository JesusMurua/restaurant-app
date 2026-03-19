import { Injectable, computed, signal } from '@angular/core';

import { Category, Product } from '../models';
import { DatabaseService } from './database.service';

/**
 * Manages the product catalog state using Angular signals.
 * Products and categories are loaded from IndexedDB (offline-first).
 * When a backend is available, call seedCatalog() after fetching from the API.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {

  //#region Properties
  private readonly _products = signal<Product[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _selectedCategoryId = signal<number | null>(null);

  readonly isLoading = signal(false);

  /** All products from the catalog (read-only) */
  readonly products = this._products.asReadonly();

  /** All active categories ordered by sortOrder (read-only) */
  readonly categories = this._categories.asReadonly();

  /** Currently selected category filter (null = show all) */
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  /**
   * Products filtered by the selected category.
   * Always excludes unavailable products.
   */
  readonly filteredProducts = computed(() => {
    const categoryId = this._selectedCategoryId();
    const all = this._products();
    if (categoryId === null) {
      return all.filter(p => p.isAvailable);
    }
    return all.filter(p => p.categoryId === categoryId && p.isAvailable);
  });
  //#endregion

  //#region Constructor
  constructor(private readonly db: DatabaseService) {}
  //#endregion

  //#region Catalog Methods

  /**
   * Loads the product catalog from IndexedDB into signals.
   * Call this on app start or when the POS view initializes.
   */
  async loadCatalog(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [products, allCategories] = await Promise.all([
        this.db.products.toArray(),
        this.db.categories.orderBy('sortOrder').toArray(),
      ]);
      this._products.set(products);
      this._categories.set(allCategories.filter(c => c.isActive));
    } catch (error) {
      console.error('[ProductService] Failed to load catalog from IndexedDB:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Persists products and categories to IndexedDB (upsert).
   * Use this to seed data from the API or from a local fixture.
   * @param products Products fetched from API or fixture
   * @param categories Categories fetched from API or fixture
   */
  async seedCatalog(products: Product[], categories: Category[]): Promise<void> {
    await this.db.transaction('rw', [this.db.products, this.db.categories], async () => {
      await this.db.products.bulkPut(products);
      await this.db.categories.bulkPut(categories);
    });
    this._products.set(products);
    this._categories.set(categories);
  }
  //#endregion

  //#region Filter Methods

  /**
   * Sets the active category filter.
   * Pass null to show all available products.
   * @param categoryId Category to filter by, or null for all
   */
  selectCategory(categoryId: number | null): void {
    this._selectedCategoryId.set(categoryId);
  }
  //#endregion

}
