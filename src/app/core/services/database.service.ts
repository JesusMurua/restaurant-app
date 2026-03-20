import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { AppConfig, Category, CartItem, Order, Product } from '../models';

/**
 * IndexedDB wrapper using Dexie.js.
 * Single source of truth for all offline-first storage.
 * Schema version must be incremented whenever stores or indexes change.
 *
 * Version history:
 *   v1 — products, categories, cart, orders
 *   v2 — added config (business settings + PIN)
 *   v3 — added kitchenStatus index to orders (KDS)
 *   v4 — added deliveryStatus index to orders (order tracking)
 */
@Injectable({ providedIn: 'root' })
export class DatabaseService extends Dexie {

  //#region Tables
  products!: Table<Product, number>;
  categories!: Table<Category, number>;
  cart!: Table<CartItem, string>;
  orders!: Table<Order, string>;
  config!: Table<AppConfig, string>;
  //#endregion

  //#region Constructor
  constructor() {
    super('pos-tactil-db');

    this.version(1).stores({
      // Only indexed fields are listed here — all other fields are stored automatically
      products:   'id, categoryId, isAvailable',
      categories: 'id, sortOrder',
      cart:       'id',
      orders:     'id, syncStatus, createdAt',
    });

    this.version(2).stores({
      products:   'id, categoryId, isAvailable',
      categories: 'id, sortOrder',
      cart:       'id',
      orders:     'id, syncStatus, createdAt',
      config:     'id',
    });

    this.version(3).stores({
      products:   'id, categoryId, isAvailable',
      categories: 'id, sortOrder',
      cart:       'id',
      orders:     'id, syncStatus, createdAt, kitchenStatus',
      config:     'id',
    });

    this.version(4).stores({
      products:   'id, categoryId, isAvailable',
      categories: 'id, sortOrder',
      cart:       'id',
      orders:     'id, syncStatus, createdAt, kitchenStatus, deliveryStatus',
      config:     'id',
    });
  }
  //#endregion

}
