import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository, ProductFilters, ProductPagination } from '../../../domain/repositories/product.repository.interface';
import { ProductOutput } from '../../dto/products/product.output';
import { PaginatedProductOutput } from '../../dto/products/paginated-product.output';
import { FilterProductsInput } from '../../dto/products/filter-products.input';

@Injectable()
export class GetAllProductsUseCase {
  constructor(@Inject('IProductRepository') private readonly productRepository: IProductRepository) {}

  async execute(filterInput: FilterProductsInput): Promise<PaginatedProductOutput> {
    const filters: ProductFilters = {
      searchTerm: filterInput.searchTerm,
      categoryId: filterInput.categoryId,
      storeId: filterInput.storeId,
      priceMin: filterInput.priceMin,
      priceMax: filterInput.priceMax,
      includeDeleted: false,
    };

    const pagination: ProductPagination = {
      page: filterInput.page || 1,
      limit: Math.min(filterInput.limit || 20, 100),
      sortBy: filterInput.sortBy || 'createdAt',
      sortOrder: filterInput.sortOrder || 'desc',
    };

    const result = await this.productRepository.findAllWithFilters(filters, pagination);

    const productOutputs = result.data.map(product => new ProductOutput(product));

    return new PaginatedProductOutput(
      productOutputs,
      result.total,
      result.page,
      result.limit,
    );
  }
}