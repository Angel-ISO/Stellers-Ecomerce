import RestServices from '$lib/services/RestServices';
import config from '$lib/config/env';
import type { OrderOutput, UpdateOrderStatusInput, CreateOrderInput } from '$lib/models/Orders/OrderType';

class OrderService {
	private readonly baseUrl = config.backendUrl;

	/**
	 * Get all orders for the current user (buyer or seller)
	 */
	public async getUserOrders(): Promise<OrderOutput[]> {
		const response = await RestServices.get<OrderOutput[]>(`${this.baseUrl}/orders`);
		// Handle response format: {data: [...]} or direct array
		return Array.isArray(response) ? response : (response as any).data || [];
	}

	/**
	 * Get orders where the current user is the seller
	 */
	public async getSellerOrders(): Promise<OrderOutput[]> {
		const response = await RestServices.get<OrderOutput[]>(`${this.baseUrl}/orders/seller`);
		return Array.isArray(response) ? response : (response as any).data || [];
	}

	/**
	 * Get order by ID
	 */
	public async getOrderById(id: string): Promise<OrderOutput> {
		const response = await RestServices.get<OrderOutput>(`${this.baseUrl}/orders/${id}`);
		return (response as any).data || response;
	}

	/**
	 * Create a new order
	 */
	public async createOrder(data: CreateOrderInput): Promise<OrderOutput> {
		const response = await RestServices.post<OrderOutput>(`${this.baseUrl}/orders`, data);
		return (response as any).data || response;
	}

	/**
	 * Update order status (generic)
	 */
	public async updateOrderStatus(id: string, status: UpdateOrderStatusInput['status']): Promise<OrderOutput> {
		const response = await RestServices.patch<OrderOutput>(`${this.baseUrl}/orders/${id}/status`, { status });
		return (response as any).data || response;
	}

	/**
	 * Mark order as PAID (seller only)
	 */
	public async markAsPaid(id: string): Promise<OrderOutput> {
		const response = await RestServices.post<OrderOutput>(`${this.baseUrl}/orders/${id}/pay`, {});
		return (response as any).data || response;
	}

	/**
	 * Mark order as SHIPPED (seller only)
	 */
	public async markAsShipped(id: string): Promise<OrderOutput> {
		const response = await RestServices.post<OrderOutput>(`${this.baseUrl}/orders/${id}/ship`, {});
		return (response as any).data || response;
	}

	/**
	 * Mark order as DELIVERED (buyer only)
	 */
	public async markAsDelivered(id: string): Promise<OrderOutput> {
		const response = await RestServices.post<OrderOutput>(`${this.baseUrl}/orders/${id}/deliver`, {});
		return (response as any).data || response;
	}

	/**
	 * Cancel order (buyer or seller depending on status)
	 */
	public async cancelOrder(id: string): Promise<OrderOutput> {
		const response = await RestServices.post<OrderOutput>(`${this.baseUrl}/orders/${id}/cancel`, {});
		return (response as any).data || response;
	}
}

const orderService = new OrderService();

export default orderService;

