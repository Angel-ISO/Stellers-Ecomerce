import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';

/**
 * Use case for deleting a specific image from a product.
 * Removes the image from storage and updates the database.
 */
@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository')
    private readonly storeRepository: IStoreRepository,
    @Inject('StoragePort')
    private readonly storagePort: StoragePort,
  ) {}

  /**
   * Executes the use case to delete a product image.
   * @param productId - ID of the product
   * @param imageIndex - Index of the image to delete (0-based)
   * @param userId - ID of the user deleting the image
   * @returns Updated product image URLs
   */
  async execute(
    productId: string,
    imageIndex: number,
    userId: string,
  ): Promise<{ imageUrls: string[] }> {
    // Find the product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify ownership through store
    const store = await this.storeRepository.findById(product.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this product');
    }

    // Validate image index
    if (imageIndex < 0 || imageIndex >= product.getImageCount()) {
      throw new BadRequestException(`Invalid image index. Product has ${product.getImageCount()} images.`);
    }

    // Get the image URL to delete
    const imageUrl = product.getImageUrl(imageIndex);
    if (!imageUrl) {
      throw new NotFoundException('Image not found at the specified index');
    }

    // Extract path from URL and delete from storage
    const path = this.extractPathFromUrl(imageUrl);
    if (path) {
      try {
        await this.storagePort.deleteFile('products', path);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        // Continue with database update even if storage deletion fails
        // The image might already be deleted or the path might be invalid
      }
    }

    // Remove image from product entity
    const updatedProduct = product.removeImage(imageIndex);

    // Save to database
    await this.productRepository.update(productId, updatedProduct);

    return {
      imageUrls: updatedProduct.imageUrls,
    };
  }

  /**
   * Extracts the file path from a full storage URL.
   * @param url - Full storage URL
   * @returns File path without bucket and base URL
   */
  private extractPathFromUrl(url: string): string {
    // URL format: {supabaseUrl}/storage/v1/object/public/products/{path}
    const parts = url.split('/products/');
    return parts.length > 1 ? parts[1] : '';
  }
}
