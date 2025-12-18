import { Product } from '../entities/product.entity';

export interface ProductFilters {
  searchTerm?: string;
  categoryId?: string;
  storeId?: string;
  priceMin?: number;
  priceMax?: number;
  includeDeleted?: boolean;
}

export interface ProductPagination {
  page: number;
  limit: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IProductRepository {
  /**
   * Creates or updates a product.
   * @param product - Product entity to save
   */
  save(product: Product): Promise<Product>;

  /**
   * Finds all products with optional pagination.
   * @param options - Pagination options
   * @deprecated Use findAllWithFilters instead for better performance
   */
  findAll(options?: { limit?: number; offset?: number }): Promise<Product[]>;

  /**
   * Finds a product by ID.
   * @param id - Product ID
   * @param includeDeleted - Whether to include soft-deleted products
   */
  findById(id: string, includeDeleted?: boolean): Promise<Product | null>;

  /**
   * Updates a product by ID.
   * @param id - Product ID
   * @param updates - Partial product updates
   */
  update(id: string, updates: Partial<Product>): Promise<Product>;

  /**
   * Soft deletes a product by setting deletedAt timestamp.
   * @param id - Product ID
   */
  softDelete(id: string): Promise<Product>;

  /**
   * Restores a soft-deleted product.
   * @param id - Product ID
   */
  restore(id: string): Promise<Product>;

  /**
   * Finds all products with filters and pagination.
   * @param filters - Search and filter criteria
   * @param pagination - Pagination and sorting options
   */
  findAllWithFilters(
    filters: ProductFilters,
    pagination: ProductPagination,
  ): Promise<PaginatedResult<Product>>;

  /**
   * Finds all products belonging to a specific store.
   * @param storeId - Store ID
   * @param includeDeleted - Whether to include soft-deleted products
   */
  findByStoreId(storeId: string, includeDeleted?: boolean): Promise<Product[]>;

  /**
   * Counts products matching the given filters.
   * @param filters - Search and filter criteria
   */
  count(filters: ProductFilters): Promise<number>;
}