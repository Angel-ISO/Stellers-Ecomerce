import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { Order, OrderItem } from '../../../domain/entities/order.entity';
import { OrderStatus } from '@prisma/client';
import { OrderOutput } from '../../dto/orders/order.output';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(orderId: string, newStatus: OrderStatus, userId: string): Promise<OrderOutput> {
    const orderData = await this.orderRepository.findById(orderId);
    if (!orderData) {
      throw new Error('Order not found');
    }

    const orderItems = orderData.items.map(item => new OrderItem(
      item.id,
      item.orderId,
      item.productId,
      item.quantity,
      item.unitPrice,
    ));

    const order = new Order(
      orderData.id,
      orderData.buyerId,
      orderData.sellerId,
      orderData.total,
      orderData.status,
      orderData.createdAt,
      orderData.updatedAt,
      orderItems,
    );

    const isBuyer = userId === order.buyerId;
    const isSeller = userId === order.sellerId;
    const userRole = isSeller ? 'seller' : isBuyer ? 'buyer' : null;

    if (!userRole) {
      throw new Error('User is not authorized to modify this order');
    }

    const updatedOrder = order.updateStatus(newStatus, userId, userRole);

    const savedOrder = await this.orderRepository.update(updatedOrder);

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