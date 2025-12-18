import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ProductNotFoundError } from '../../../domain/errors/domain.errors';
import { ProductOutput } from '../../dto/products/product.output';

@Injectable()
export class GetProductByIdUseCase {
  constructor(@Inject('IProductRepository') private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<ProductOutput> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    return new ProductOutput(product);
  }
}