import type { User } from '$lib/models/Users/UserType';
import UserService from '$lib/services/User/User.service';

export class CustomersViewModel {
	customers = $state<User[]>([]);
	isLoading = $state(false);
	searchQuery = $state('');


	filteredCustomers = $derived(() => {
		if (!this.searchQuery) return this.customers;

		return this.customers.filter(
			(c) =>
				(c.displayName && c.displayName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
				(c.email && c.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
		);
	});

	totalCustomers = $derived(() => this.customers.length);

	totalRevenue = $derived(() => {
		return 0;
	});

	averageOrderValue = $derived(() => {
		return 0;
	});

	topCustomers = $derived(() => {
		return [...this.customers].slice(0, 10);
	});

	async loadCustomers() {
		this.isLoading = true;
		try {
			this.customers = await UserService.getAllUsers();
		} catch (error) {
			console.error('Error loading customers:', error);
		} finally {
			this.isLoading = false;
		}
	}

	async updateCustomer(id: string, updates: Partial<User>) {

		console.log('Updating customer:', id, updates);
		const index = this.customers.findIndex((c) => c.id === id);
		if (index !== -1) {
			this.customers[index] = { ...this.customers[index], ...updates };
		}
	}

	async deleteCustomer(id: string) {
		console.log('Deleting customer:', id);
		this.customers = this.customers.filter((c) => c.id !== id);
	}

	getCustomerInitials(displayName: string): string {
		if (!displayName) {
			return '??';
		}
		return displayName
			.split(' ')
			.map((n) => n)
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
}
