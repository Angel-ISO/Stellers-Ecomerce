import { OrderStatus } from '@prisma/client';

export class Order {
  constructor(
    public readonly id: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly total: number,
    public readonly status: OrderStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly items: OrderItem[] = [],
  ) {}

  static create(buyerId: string, sellerId: string, total: number, items: OrderItem[]): Order {
    if (buyerId === sellerId) {
      throw new Error('Buyer cannot purchase from themselves');
    }

    if (total <= 0) {
      throw new Error('Order total must be greater than 0');
    }

    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const id = crypto.randomUUID();
    const now = new Date();

    return new Order(id, buyerId, sellerId, total, OrderStatus.PENDING, now, now, items);
  }

  canTransitionTo(newStatus: OrderStatus, userId: string, userRole: 'buyer' | 'seller'): boolean {
    switch (this.status) {
      case OrderStatus.PENDING:
        return newStatus === OrderStatus.PAID && userRole === 'seller' && userId === this.sellerId;

      case OrderStatus.PAID:
        return newStatus === OrderStatus.SHIPPED && userRole === 'seller' && userId === this.sellerId;

      case OrderStatus.SHIPPED:
        return (
          (newStatus === OrderStatus.DELIVERED && userRole === 'buyer' && userId === this.buyerId) ||
          (newStatus === OrderStatus.CANCELLED && ((userRole === 'buyer' && userId === this.buyerId) || (userRole === 'seller' && userId === this.sellerId)))
        );

      case OrderStatus.DELIVERED:
      case OrderStatus.CANCELLED:
        return false;

      default:
        return false;
    }
  }

  updateStatus(newStatus: OrderStatus, userId: string, userRole: 'buyer' | 'seller'): Order {
    if (!this.canTransitionTo(newStatus, userId, userRole)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    return new Order(
      this.id,
      this.buyerId,
      this.sellerId,
      this.total,
      newStatus,
      this.createdAt,
      new Date(),
      this.items,
    );
  }
}

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}

  static create(orderId: string, productId: string, quantity: number, unitPrice: number): OrderItem {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (unitPrice <= 0) {
      throw new Error('Unit price must be greater than 0');
    }

    const id = crypto.randomUUID();

    return new OrderItem(id, orderId, productId, quantity, unitPrice);
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }
}