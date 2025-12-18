import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderItemOutput {
  @ApiProperty({
    description: 'Order item ID',
    example: 'item_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'prod_123456789'
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones'
  })
  productName: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price at time of order',
    example: 99.99
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Total for this item',
    example: 199.98
  })
  total: number;
}

export class OrderOutput {
  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Buyer ID',
    example: 'user_123456789'
  })
  buyerId: string;

  @ApiProperty({
    description: 'Seller ID',
    example: 'user_987654321'
  })
  sellerId: string;

  @ApiProperty({
    description: 'Order total',
    example: 299.97
  })
  total: number;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemOutput]
  })
  items: OrderItemOutput[];

  @ApiProperty({
    description: 'Order creation date',
    example: '2025-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Order last update date',
    example: '2025-01-15T10:30:00Z'
  })
  updatedAt: Date;
}