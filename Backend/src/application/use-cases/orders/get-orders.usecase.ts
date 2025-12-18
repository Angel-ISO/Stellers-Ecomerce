import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository, OrderFilters, OrderPagination } from '../../../domain/repositories/order.repository.interface';
import { OrderOutput } from '../../dto/orders/order.output';

@Injectable()
export class GetOrdersUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(filters?: OrderFilters, pagination?: OrderPagination): Promise<OrderOutput[]> {
    const orders = await this.orderRepository.findAll(filters, pagination);

    return orders.map(order => ({
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: '', // Will be populated by controller if needed
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    }));
  }

  async executeByBuyer(buyerId: string, pagination?: OrderPagination): Promise<OrderOutput[]> {
    const orders = await this.orderRepository.findByBuyerId(buyerId, pagination);

    return orders.map(order => ({
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: '', // Will be populated by controller if needed
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    }));
  }

  async executeBySeller(sellerId: string, pagination?: OrderPagination): Promise<OrderOutput[]> {
    const orders = await this.orderRepository.findBySellerId(sellerId, pagination);

    return orders.map(order => ({
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: '', // Will be populated by controller if needed
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    }));
  }

  async executeById(orderId: string): Promise<OrderOutput | null> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) return null;

    return {
      id: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: '', // Will be populated by controller if needed
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    };
  }
}