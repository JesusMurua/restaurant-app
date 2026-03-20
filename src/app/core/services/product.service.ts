import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';

import { Category, Product } from '../models';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

/** Branch ID — hardcoded until multi-branch support is implemented */
const BRANCH_ID = 1;

/**
 * Manages the product catalog state using Angular signals.
 *
 * Hybrid "stale-while-revalidate" strategy:
 *   1. Load immediately from IndexedDB (instant UI)
 *   2. Fetch from API in background
 *   3. If API succeeds → update Dexie + signals (UI refreshes)
 *   4. If API fails → keep Dexie data (offline mode)
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
  constructor(
    private readonly db: DatabaseService,
    private readonly api: ApiService,
  ) {}
  //#endregion

  //#region Catalog Methods

  /**
   * Stale-while-revalidate catalog load:
   *   1. Serve cached data from IndexedDB immediately
   *   2. Fetch fresh data from API in background
   *   3. Update Dexie + signals if API succeeds
   */
  async loadCatalog(): Promise<void> {
    this.isLoading.set(true);

    // Step 1 — Serve stale data from Dexie (instant UI)
    try {
      const [localProducts, allCategories] = await Promise.all([
        this.db.products.toArray(),
        this.db.categories.orderBy('sortOrder').toArray(),
      ]);
      this._products.set(localProducts);
      this._categories.set(allCategories.filter(c => c.isActive));
    } catch (error) {
      console.error('[ProductService] Failed to load catalog from IndexedDB:', error);
    }

    // Step 2 — Try API (awaited so callers know when done)
    await this.revalidateFromApi();

    this.isLoading.set(false);
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
    this._categories.set(categories.filter(c => c.isActive));
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

  //#region Private Helpers

  /**
   * Fetches products and categories from the API and updates local cache.
   * Runs silently in background — errors are logged but never block the UI.
   */
  private async revalidateFromApi(): Promise<void> {
    try {
      const [products, categories] = await firstValueFrom(
        forkJoin([
          this.api.get<Product[]>(`/products?branchId=${BRANCH_ID}`),
          this.api.get<Category[]>(`/categories?branchId=${BRANCH_ID}`),
        ]),
      );
      await this.seedCatalog(products, categories);
      console.info('[ProductService] Catalog updated from API');
    } catch (error) {
      console.warn('[ProductService] API unreachable — using cached catalog:', error);
    }
  }
  //#endregion

}
