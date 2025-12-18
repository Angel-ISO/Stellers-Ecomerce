import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';
import { ProductOutput } from '../../dto/products/product.output';
import { ProductNotFoundError, UnauthorizedProductAccessError } from '../../../domain/errors/domain.errors';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
    @Inject('StoragePort') private readonly storagePort: StoragePort,
  ) {}

  async execute(productId: string, userId: string): Promise<ProductOutput> {
    // Find the product
    const product = await this.productRepository.findById(productId, false);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    // Verify ownership through store
    const isOwner = await this.storeRepository.verifyOwnership(product.storeId, userId);
    if (!isOwner) {
      throw new UnauthorizedProductAccessError(userId, productId);
    }

    // Delete all product images from storage
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        try {
          const path = this.extractPathFromUrl(imageUrl);
          if (path) {
            await this.storagePort.deleteFile('products', path);
          }
        } catch (error) {
          // Log error but continue with deletion
          // Storage deletion failure shouldn't prevent product deletion
          console.error(`Failed to delete image from storage: ${imageUrl}`, error);
        }
      }
    }

    // Soft delete the product
    const deletedProduct = await this.productRepository.softDelete(productId);
    return new ProductOutput(deletedProduct);
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
