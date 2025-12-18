// Order types based on backend API
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemOutput {
	id: string;
	productId: string;
	productName?: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

export interface OrderOutput {
	id: string;
	buyerId: string;
	sellerId: string;
	total: number;
	status: OrderStatus;
	items: OrderItemOutput[];
	createdAt: string;
	updatedAt: string;
}

export interface UpdateOrderStatusInput {
	status: OrderStatus;
}

export interface CreateOrderInput {
	items: Array<{
		productId: string;
		quantity: number;
	}>;
}

