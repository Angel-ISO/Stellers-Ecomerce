import { ApiProperty } from '@nestjs/swagger';
import { ProductOutput } from './product.output';

/**
 * Paginated response for product listings.
 */
export class PaginatedProductOutput {
  @ApiProperty({
    description: 'List of products',
    type: [ProductOutput]
  })
  data: ProductOutput[];

  @ApiProperty({
    description: 'Total number of products matching the filter',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPreviousPage: boolean;

  constructor(
    data: ProductOutput[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}
