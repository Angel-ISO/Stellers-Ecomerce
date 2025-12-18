import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for filtering and searching products with pagination support.
 */
export class FilterProductsInput {
  @ApiProperty({
    description: 'Search term to find in product name or description',
    required: false,
    example: 'laptop'
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by store ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({
    description: 'Minimum price filter',
    minimum: 0,
    required: false,
    example: 10.99
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMin?: number;

  @ApiProperty({
    description: 'Maximum price filter',
    minimum: 0,
    required: false,
    example: 999.99
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMax?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Sort field (price, createdAt, name)',
    enum: ['price', 'createdAt', 'name'],
    default: 'createdAt',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'createdAt' | 'name' = 'createdAt';

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
