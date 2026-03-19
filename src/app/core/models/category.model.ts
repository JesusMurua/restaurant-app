/**
 * Represents a product category shown in the category filter bar.
 */
export interface Category {
  id: number;
  name: string;
  /** Optional icon key (PrimeIcons class name, e.g. 'pi-utensils') */
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}
