import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { ProductOutput } from '../../dto/products/product.output';
import { StoreNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class GetProductsByStoreUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(userId: string): Promise<ProductOutput[]> {
    // Find the user's store
    const store = await this.storeRepository.findByOwnerId(userId);
    if (!store) {
      throw new StoreNotFoundError(`No store found for user ${userId}`);
    }

    // Get all products for this store
    const products = await this.productRepository.findByStoreId(store.id, false);
    return products.map(product => new ProductOutput(product));
  }
}
