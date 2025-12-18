
/**
 * Product domain entity representing a product in the e-commerce system.
 * Contains business rules and validation logic.
 */
export class Product {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public name: string,
    public description: string | undefined,
    public price: number,
    public stock: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly categoryId?: string,
    public readonly imageUrls: string[] = [],
    public readonly isActive: boolean = true,
    public readonly deletedAt: Date | null = null,
  ) {
    this.validate();
  }

  /**
   * Validates the product business rules.
   * @throws Error if validation fails
   */
  private validate(): void {
    if (this.price < 0) {
      throw new Error('Product price cannot be negative');
    }
    if (this.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
    if (!this.name.trim()) {
      throw new Error('Product name cannot be empty');
    }
    if (!this.storeId) {
      throw new Error('Product must belong to a store');
    }
  }

  /**
   * Updates the product with new data.
   * @param updates - Partial product data
   * @returns New Product instance with updated data
   */
  update(updates: Partial<Pick<Product, 'name' | 'description' | 'price' | 'stock' | 'isActive'>>): Product {
    if (this.isDeleted()) {
      throw new Error('Cannot update a deleted product');
    }

    return new Product(
      this.id,
      this.storeId,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.price ?? this.price,
      updates.stock ?? this.stock,
      this.createdAt,
      new Date(),
      this.categoryId,
      this.imageUrls,
      updates.isActive ?? this.isActive,
      this.deletedAt,
    );
  }

  /**
   * Checks if the product belongs to a specific store.
   * @param storeId - Store ID to check ownership
   * @returns True if the product belongs to the store
   */
  belongsTo(storeId: string): boolean {
    return this.storeId === storeId;
  }

  /**
   * Checks if the product is soft deleted.
   * @returns True if the product is deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Deactivates the product (soft delete).
   * @returns New Product instance with deletedAt set
   */
  deactivate(): Product {
    if (this.isDeleted()) {
      throw new Error('Product is already deleted');
    }

    return new Product(
      this.id,
      this.storeId,
      this.name,
      this.description,
      this.price,
      this.stock,
      this.createdAt,
      new Date(),
      this.categoryId,
      this.imageUrls,
      false,
      new Date(),
    );
  }

  /**
   * Restores a soft-deleted product.
   * @returns New Product instance with deletedAt set to null
   */
  restore(): Product {
    if (!this.isDeleted()) {
      throw new Error('Product is not deleted');
    }

    return new Product(
      this.id,
      this.storeId,
      this.name,
      this.description,
      this.price,
      this.stock,
      this.createdAt,
      new Date(),
      this.categoryId,
      this.imageUrls,
      true,
      null,
    );
  }

  /**
   * Adds a new image URL to the product.
   * @param imageUrl - The URL of the image to add
   * @returns New Product instance with the image added
   */
  addImage(imageUrl: string): Product {
    if (this.isDeleted()) {
      throw new Error('Cannot add images to a deleted product');
    }

    if (!imageUrl || !imageUrl.trim()) {
      throw new Error('Image URL cannot be empty');
    }

    const newImageUrls = [...this.imageUrls, imageUrl];

    return new Product(
      this.id,
      this.storeId,
      this.name,
      this.description,
      this.price,
      this.stock,
      this.createdAt,
      new Date(),
      this.categoryId,
      newImageUrls,
      this.isActive,
      this.deletedAt,
    );
  }

  /**
   * Removes an image URL from the product by index.
   * @param index - The index of the image to remove
   * @returns New Product instance with the image removed
   */
  removeImage(index: number): Product {
    if (this.isDeleted()) {
      throw new Error('Cannot remove images from a deleted product');
    }

    if (index < 0 || index >= this.imageUrls.length) {
      throw new Error('Invalid image index');
    }

    const newImageUrls = this.imageUrls.filter((_, i) => i !== index);

    return new Product(
      this.id,
      this.storeId,
      this.name,
      this.description,
      this.price,
      this.stock,
      this.createdAt,
      new Date(),
      this.categoryId,
      newImageUrls,
      this.isActive,
      this.deletedAt,
    );
  }

  /**
   * Gets the URL of a specific image by index.
   * @param index - The index of the image
   * @returns The image URL
   */
  getImageUrl(index: number): string | undefined {
    return this.imageUrls[index];
  }

  /**
   * Gets the total number of images.
   * @returns The number of images
   */
  getImageCount(): number {
    return this.imageUrls.length;
  }
}