import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemInput {
  @ApiProperty({
    description: 'Product ID to order',
    example: 'prod_123456789'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to order',
    minimum: 1,
    example: 2
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderInput {
  @ApiProperty({
    description: 'Array of order items',
    type: [CreateOrderItemInput],
    example: [
      { productId: 'prod_123456789', quantity: 2 },
      { productId: 'prod_987654321', quantity: 1 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items: CreateOrderItemInput[];
}