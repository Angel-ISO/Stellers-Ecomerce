import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../../domain/entities/product.entity';

export class ProductOutput {
  @ApiProperty({ description: 'Product unique identifier' })
  id: string;

  @ApiProperty({ description: 'Store identifier' })
  storeId: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product description', required: false })
  description?: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  price: number;

  @ApiProperty({ description: 'Available stock quantity', minimum: 0 })
  stock: number;

  @ApiProperty({ description: 'Category identifier', required: false })
  categoryId?: string;

  @ApiProperty({ description: 'Product image URLs', type: [String] })
  imageUrls: string[];

  @ApiProperty({ description: 'Whether the product is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Product creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Product last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Product deletion date (null if not deleted)', required: false })
  deletedAt: Date | null;

  constructor(product: Product) {
    this.id = product.id;
    this.storeId = product.storeId;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stock = product.stock;
    this.categoryId = product.categoryId;
    this.imageUrls = product.imageUrls;
    this.isActive = product.isActive;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    this.deletedAt = product.deletedAt;
  }
}