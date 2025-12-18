import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusInput {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.PAID,
    enumName: 'OrderStatus'
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}