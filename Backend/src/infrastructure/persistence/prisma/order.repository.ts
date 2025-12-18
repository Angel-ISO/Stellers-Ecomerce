import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { IOrderRepository, OrderFilters, OrderPagination, OrderWithItems } from '../../../domain/repositories/order.repository.interface';
import { Order, OrderItem } from '../../../domain/entities/order.entity';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<Order> {
    const createdOrder = await this.prisma.order.create({
      data: {
        id: order.id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        total: order.total,
        status: order.status,
        items: {
          create: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return new Order(
      createdOrder.id,
      createdOrder.buyerId,
      createdOrder.sellerId,
      createdOrder.total,
      createdOrder.status,
      createdOrder.createdAt,
      createdOrder.updatedAt,
      createdOrder.items.map(item => new OrderItem(
        item.id,
        item.orderId,
        item.productId,
        item.quantity,
        item.unitPrice,
      )),
    );
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

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
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  }

  async findByBuyerId(buyerId: string, pagination?: OrderPagination): Promise<OrderWithItems[]> {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: pagination ? {
        [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
      } : { createdAt: 'desc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : 0,
      take: pagination?.limit,
    });

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
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }));
  }

  async findBySellerId(sellerId: string, pagination?: OrderPagination): Promise<OrderWithItems[]> {
    const orders = await this.prisma.order.findMany({
      where: { sellerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: pagination ? {
        [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
      } : { createdAt: 'desc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : 0,
      take: pagination?.limit,
    });

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
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }));
  }

  async findAll(filters?: OrderFilters, pagination?: OrderPagination): Promise<OrderWithItems[]> {
    const where: any = {};

    if (filters?.buyerId) where.buyerId = filters.buyerId;
    if (filters?.sellerId) where.sellerId = filters.sellerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: pagination ? {
        [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'desc',
      } : { createdAt: 'desc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : 0,
      take: pagination?.limit,
    });

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
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }));
  }

  async update(order: Order): Promise<Order> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        updatedAt: order.updatedAt,
      },
      include: {
        items: true,
      },
    });

    return new Order(
      updatedOrder.id,
      updatedOrder.buyerId,
      updatedOrder.sellerId,
      updatedOrder.total,
      updatedOrder.status,
      updatedOrder.createdAt,
      updatedOrder.updatedAt,
      updatedOrder.items.map(item => new OrderItem(
        item.id,
        item.orderId,
        item.productId,
        item.quantity,
        item.unitPrice,
      )),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async count(filters?: OrderFilters): Promise<number> {
    const where: any = {};

    if (filters?.buyerId) where.buyerId = filters.buyerId;
    if (filters?.sellerId) where.sellerId = filters.sellerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    return this.prisma.order.count({ where });
  }

  async getSellerIdFromProductId(productId: string): Promise<string> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!product || !product.store) {
      throw new Error(`Product ${productId} not found or has no store`);
    }

    return product.store.ownerId;
  }

  async validateOrderItems(items: { productId: string; quantity: number }[]): Promise<{
    validItems: { productId: string; quantity: number; unitPrice: number; sellerId: string }[];
    invalidItems: { productId: string; reason: string }[];
    groupedBySeller: Record<string, { productId: string; quantity: number; unitPrice: number }[]>;
  }> {
    const validItems: { productId: string; quantity: number; unitPrice: number; sellerId: string }[] = [];
    const invalidItems: { productId: string; reason: string }[] = [];
    const groupedBySeller: Record<string, { productId: string; quantity: number; unitPrice: number }[]> = {};

    for (const item of items) {
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            store: {
              select: {
                ownerId: true,
              },
            },
          },
        });

        if (!product) {
          invalidItems.push({ productId: item.productId, reason: 'Product not found' });
          continue;
        }

        if (!product.isActive) {
          invalidItems.push({ productId: item.productId, reason: 'Product is not active' });
          continue;
        }

        if (product.stock < item.quantity) {
          invalidItems.push({
            productId: item.productId,
            reason: `Insufficient stock. Available: ${product.stock}, requested: ${item.quantity}`
          });
          continue;
        }

        if (!product.store) {
          invalidItems.push({ productId: item.productId, reason: 'Product has no associated store' });
          continue;
        }

        const sellerId = product.store.ownerId;
        validItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          sellerId,
        });

        if (!groupedBySeller[sellerId]) {
          groupedBySeller[sellerId] = [];
        }
        groupedBySeller[sellerId].push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });

      } catch (error) {
        invalidItems.push({ productId: item.productId, reason: 'Database error' });
      }
    }

    return { validItems, invalidItems, groupedBySeller };
  }
}