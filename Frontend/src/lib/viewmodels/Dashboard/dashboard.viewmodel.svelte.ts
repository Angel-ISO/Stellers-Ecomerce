import type { DashboardStats, Order } from '$lib/models/mock-types';
import { mockDashboardStats, mockOrders } from '$lib/models/mock-data';

export class DashboardViewModel {
	stats = $state<DashboardStats>(mockDashboardStats);
	recentOrders = $state<Order[]>(mockOrders.slice(0, 5));
	isLoading = $state(false);
	totalRevenue = $derived(this.stats.totalRevenue);
	totalOrders = $derived(this.stats.totalOrders);
	totalProducts = $derived(this.stats.totalProducts);
	totalCustomers = $derived(this.stats.totalCustomers);


	async refreshStats() {
		this.isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.stats = mockDashboardStats;
		this.isLoading = false;
	}

	async loadRecentOrders() {
		this.isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.recentOrders = mockOrders.slice(0, 5);
		this.isLoading = false;
	}

	getOrderStatusColor(status: string): 'success' | 'default' | 'warning' | 'destructive' | 'secondary' {
		switch (status) {
			case 'delivered':
				return 'success';
			case 'in_transit':
			case 'shipped':
				return 'default';
			case 'processing':
				return 'warning';
			case 'pending':
				return 'warning';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	}
}
