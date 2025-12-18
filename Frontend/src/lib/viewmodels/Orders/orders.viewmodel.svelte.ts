import type { OrderStatus } from '$lib/models/Orders/OrderType';
import type { OrderOutput } from '$lib/models/Orders/OrderType';
import orderService from '$lib/services/Orders/Order.service';
import { authState } from '$lib/stores/auth.svelte';

export class OrdersViewModel {
	orders = $state<OrderOutput[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);
	searchQuery = $state('');
	selectedStatus = $state<string | null>(null);

	filteredOrders = $derived(() => {
		let filtered = this.orders;

		if (this.searchQuery) {
			const query = this.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(o) =>
					o.id.toLowerCase().includes(query) ||
					o.items.some((item) => item.productName?.toLowerCase().includes(query))
			);
		}

		if (this.selectedStatus) {
			filtered = filtered.filter((o) => o.status === this.selectedStatus);
		}

		return filtered;
	});

	totalRevenue = $derived(() => {
		return this.orders.reduce((sum, order) => sum + order.total, 0);
	});

	pendingOrders = $derived(() => {
		return this.orders.filter((o) => o.status === 'PENDING').length;
	});

	processingOrders = $derived(() => {
		return this.orders.filter((o) => o.status === 'PAID').length;
	});

	deliveredOrders = $derived(() => {
		return this.orders.filter((o) => o.status === 'DELIVERED').length;
	});

	/**
	 * Check if the current user is the seller of an order
	 */
	isSeller(order: OrderOutput): boolean {
		return authState.user?.id === order.sellerId;
	}

	/**
	 * Check if the current user is the buyer of an order
	 */
	isBuyer(order: OrderOutput): boolean {
		return authState.user?.id === order.buyerId;
	}

	/**
	 * Load all orders for the current user (both as buyer and seller)
	 */
	async loadOrders() {
		this.isLoading = true;
		this.error = null;
		try {
			// Cargar órdenes como comprador y como vendedor
			const [userOrders, sellerOrders] = await Promise.all([
				orderService.getUserOrders().catch(() => []),
				orderService.getSellerOrders().catch(() => [])
			]);

			// Combinar ambas listas y eliminar duplicados por ID
			const allOrders = [...userOrders, ...sellerOrders];
			const uniqueOrders = allOrders.filter(
				(order, index, self) => index === self.findIndex((o) => o.id === order.id)
			);

			this.orders = uniqueOrders;
			console.log('Loaded orders:', {
				userOrders: userOrders.length,
				sellerOrders: sellerOrders.length,
				total: uniqueOrders.length
			});
		} catch (err: any) {
			this.error = err.message || 'Error al cargar las órdenes';
			console.error('Error loading orders:', err);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Update order status (generic)
	 */
	async updateOrderStatus(orderId: string, status: OrderStatus) {
		try {
			const updatedOrder = await orderService.updateOrderStatus(orderId, status);
			const index = this.orders.findIndex((o) => o.id === orderId);
			if (index !== -1) {
				this.orders[index] = updatedOrder;
			}
			return updatedOrder;
		} catch (err: any) {
			this.error = err.message || 'Error al actualizar el estado de la orden';
			throw err;
		}
	}

	/**
	 * Mark order as PAID (seller only)
	 */
	async markAsPaid(orderId: string) {
		try {
			const updatedOrder = await orderService.markAsPaid(orderId);
			const index = this.orders.findIndex((o) => o.id === orderId);
			if (index !== -1) {
				this.orders[index] = updatedOrder;
			}
			return updatedOrder;
		} catch (err: any) {
			this.error = err.message || 'Error al marcar la orden como pagada';
			throw err;
		}
	}

	/**
	 * Mark order as SHIPPED (seller only)
	 */
	async markAsShipped(orderId: string) {
		try {
			const updatedOrder = await orderService.markAsShipped(orderId);
			const index = this.orders.findIndex((o) => o.id === orderId);
			if (index !== -1) {
				this.orders[index] = updatedOrder;
			}
			return updatedOrder;
		} catch (err: any) {
			this.error = err.message || 'Error al marcar la orden como enviada';
			throw err;
		}
	}

	/**
	 * Mark order as DELIVERED (buyer only)
	 */
	async markAsDelivered(orderId: string) {
		try {
			const updatedOrder = await orderService.markAsDelivered(orderId);
			const index = this.orders.findIndex((o) => o.id === orderId);
			if (index !== -1) {
				this.orders[index] = updatedOrder;
			}
			return updatedOrder;
		} catch (err: any) {
			this.error = err.message || 'Error al marcar la orden como entregada';
			throw err;
		}
	}

	/**
	 * Cancel order
	 */
	async cancelOrder(orderId: string) {
		try {
			const updatedOrder = await orderService.cancelOrder(orderId);
			const index = this.orders.findIndex((o) => o.id === orderId);
			if (index !== -1) {
				this.orders[index] = updatedOrder;
			}
			return updatedOrder;
		} catch (err: any) {
			this.error = err.message || 'Error al cancelar la orden';
			throw err;
		}
	}

	getOrderStatusColor(status: string): 'success' | 'default' | 'warning' | 'destructive' | 'secondary' {
		switch (status) {
			case 'DELIVERED':
				return 'success';
			case 'SHIPPED':
				return 'default';
			case 'PAID':
				return 'default';
			case 'PENDING':
				return 'warning';
			case 'CANCELLED':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	getOrderStatusLabel(status: string): string {
		switch (status) {
			case 'PENDING':
				return 'Pendiente';
			case 'PAID':
				return 'Pagado';
			case 'SHIPPED':
				return 'Enviado';
			case 'DELIVERED':
				return 'Entregado';
			case 'CANCELLED':
				return 'Cancelado';
			default:
				return status;
		}
	}

	/**
	 * Get available status transitions for seller
	 */
	getSellerAvailableActions(status: OrderStatus): OrderStatus[] {
		switch (status) {
			case 'PENDING':
				return ['PAID'];
			case 'PAID':
				return ['SHIPPED'];
			case 'SHIPPED':
				return ['CANCELLED'];
			default:
				return [];
		}
	}

	/**
	 * Get available status transitions for buyer
	 */
	getBuyerAvailableActions(status: OrderStatus): OrderStatus[] {
		switch (status) {
			case 'SHIPPED':
				return ['DELIVERED', 'CANCELLED'];
			default:
				return [];
		}
	}
}
