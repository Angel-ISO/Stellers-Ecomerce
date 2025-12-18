import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { UpdateProductInput } from '../../dto/products/update-product.input';
import { ProductOutput } from '../../dto/products/product.output';
import { ProductNotFoundError, UnauthorizedProductAccessError } from '../../../domain/errors/domain.errors';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(productId: string, input: UpdateProductInput, userId: string): Promise<ProductOutput> {
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

    // Update the product
    const updatedProduct = await this.productRepository.update(productId, input);
    return new ProductOutput(updatedProduct);
  }
}
