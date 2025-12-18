import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { ProductOutput } from '../../dto/products/product.output';
import { ProductNotFoundError, UnauthorizedProductAccessError } from '../../../domain/errors/domain.errors';

@Injectable()
export class RestoreProductUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(productId: string, userId: string): Promise<ProductOutput> {
    // Find the product (including deleted ones)
    const product = await this.productRepository.findById(productId, true);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    // Verify ownership through store
    const isOwner = await this.storeRepository.verifyOwnership(product.storeId, userId);
    if (!isOwner) {
      throw new UnauthorizedProductAccessError(userId, productId);
    }

    // Restore the product
    const restoredProduct = await this.productRepository.restore(productId);
    return new ProductOutput(restoredProduct);
  }
}
