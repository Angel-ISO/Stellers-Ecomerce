import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { Order, OrderItem } from '../../../domain/entities/order.entity';
import { CreateOrderInput } from '../../dto/orders/create-order.input';
import { OrderOutput, OrderItemOutput } from '../../dto/orders/order.output';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: CreateOrderInput, buyerId: string): Promise<OrderOutput> {
    const validation = await this.orderRepository.validateOrderItems(
      input.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
    );

    if (validation.invalidItems.length > 0) {
      throw new Error(`Invalid order items: ${validation.invalidItems.map(item => `${item.productId}: ${item.reason}`).join(', ')}`);
    }

    const sellerIds = Object.keys(validation.groupedBySeller);
    if (sellerIds.length !== 1) {
      throw new Error('All order items must belong to the same seller. Multi-seller orders are not supported yet.');
    }

    const sellerId = sellerIds[0];

    if (buyerId === sellerId) {
      throw new Error('You cannot purchase your own products');
    }

    const total = validation.validItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const orderItems = validation.validItems.map(item =>
      OrderItem.create('', item.productId, item.quantity, item.unitPrice)
    );

    const order = Order.create(buyerId, sellerId, total, orderItems);

    const savedOrder = await this.orderRepository.create(order);

    return {
      id: savedOrder.id,
      buyerId: savedOrder.buyerId,
      sellerId: savedOrder.sellerId,
      total: savedOrder.total,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt,
      updatedAt: savedOrder.updatedAt,
      items: savedOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };
  }
}