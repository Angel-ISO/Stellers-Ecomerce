import { OrderStatus } from '@prisma/client';
import { Order, OrderItem } from '../entities/order.entity';

export interface OrderFilters {
  buyerId?: string;
  sellerId?: string;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderPagination {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderWithItems {
  id: string;
  buyerId: string;
  sellerId: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByBuyerId(buyerId: string, pagination?: OrderPagination): Promise<OrderWithItems[]>;
  findBySellerId(sellerId: string, pagination?: OrderPagination): Promise<OrderWithItems[]>;
  findAll(filters?: OrderFilters, pagination?: OrderPagination): Promise<OrderWithItems[]>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
  count(filters?: OrderFilters): Promise<number>;

  getSellerIdFromProductId(productId: string): Promise<string>;
  validateOrderItems(items: { productId: string; quantity: number }[]): Promise<{
    validItems: { productId: string; quantity: number; unitPrice: number; sellerId: string }[];
    invalidItems: { productId: string; reason: string }[];
    groupedBySeller: Record<string, { productId: string; quantity: number; unitPrice: number }[]>;
  }>;
}