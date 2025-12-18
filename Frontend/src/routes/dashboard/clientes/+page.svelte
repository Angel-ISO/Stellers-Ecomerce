<script lang="ts">
    import DashboardHeader from '../components/DashboardHeader.svelte';
    import Card from '$lib/components/ui/card.svelte';
    import Badge from '$lib/components/ui/badge.svelte';
    import Button from '$lib/components/ui/button.svelte';
    import Input from '$lib/components/ui/input.svelte';
    import Avatar from '$lib/components/ui/avatar.svelte';
    import { CustomersViewModel } from '$lib/viewmodels/Customers/customers.viewmodel.svelte.js';
    import { formatCurrency, formatDate } from '$lib/lib/utils';
    import { Search, UserPlus, Mail, Phone, Eye, Edit, Trash2 } from 'lucide-svelte';

	const viewModel = new CustomersViewModel();

	viewModel.loadCustomers();


	function handleAddCustomer() {
		console.log('Add new customer');
		// TODO: Open add customer modal
	}

	function handleViewCustomer(customerId: string) {
		console.log('View customer:', customerId);
		// TODO: Navigate to customer details
	}

	function handleEditCustomer(customerId: string) {
		console.log('Edit customer:', customerId);
		// TODO: Open edit customer modal
	}

	function handleDeleteCustomer(customerId: string) {
		if (confirm('Are you sure you want to delete this customer?')) {
			viewModel.deleteCustomer(customerId);
		}
	}

</script>

<DashboardHeader title="Clientes" subtitle="Manage your customer base">
	{#snippet actions()}
		<Button variant="default" onclick={handleAddCustomer}>
			<UserPlus class="w-4 h-4 mr-2" />
			Add Customer
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<Card class="p-6">
			<h3 class="text-sm text-gray-600 mb-2">Total Customers</h3>
			<p class="text-3xl font-bold text-gray-900">{viewModel.totalCustomers()}</p>
		</Card>
		<Card class="p-6">
			<h3 class="text-sm text-gray-600 mb-2">Total Revenue</h3>
			<p class="text-3xl font-bold text-gray-900">{formatCurrency(viewModel.totalRevenue())}</p>
		</Card>
		<Card class="p-6">
			<h3 class="text-sm text-gray-600 mb-2">Avg. Order Value</h3>
			<p class="text-3xl font-bold text-gray-900">
				{formatCurrency(viewModel.averageOrderValue())}
			</p>
		</Card>
	</div>

	<!-- Search -->
	<Card class="p-6">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
			<Input
				bind:value={viewModel.searchQuery}
				placeholder="Search customers by name or email..."
				class="pl-10"
			/>
		</div>
	</Card>

	<!-- Top Customers -->
	{#if viewModel.searchQuery === ''}
		<Card>
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-bold text-gray-900">Top Customers</h2>
				<p class="text-sm text-gray-600 mt-1">Ranked by total spending</p>
			</div>
			<div class="p-6">
				<div class="space-y-4">
					{#each viewModel.topCustomers().slice(0, 5) as customer, index}
						<div
							class="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
						>
							<div class="text-lg font-bold text-gray-400 w-8 text-center">
								#{index + 1}
							</div>
							<Avatar
								fallback={viewModel.getCustomerInitials(customer.displayName)}
								src={customer.avatarUrl}
								class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold"
							/>
							<div class="flex-1 min-w-0">
								<p class="font-semibold text-gray-900">{customer.displayName}</p>
								<p class="text-sm text-gray-600">{customer.email || 'No email'}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Card>
	{/if}

	<!-- Customers Table -->
	<Card>
		<div class="p-6 border-b border-gray-200">
			<h2 class="text-xl font-bold text-gray-900">
				{viewModel.searchQuery ? 'Search Results' : 'All Customers'}
			</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Customer
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Contact
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#if viewModel.filteredCustomers().length === 0}
						<tr>
							<td colspan="6" class="px-6 py-8 text-center text-gray-500">
								No customers found. Try adjusting your search.
							</td>
						</tr>
					{:else}
						{#each viewModel.filteredCustomers() as customer}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-3">
										<Avatar
											fallback={viewModel.getCustomerInitials(customer.displayName)}
											src={customer.avatarUrl}
											class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold"
										/>
										<div>
											<p class="font-medium text-gray-900">{customer.displayName}</p>
											<p class="text-sm text-gray-600">
												Member since {formatDate(customer.createdAt)}
											</p>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="flex flex-col gap-1">
										{#if customer.email}
											<div class="flex items-center gap-2 text-gray-600">
												<Mail class="w-4 h-4" />
												<span>{customer.email}</span>
											</div>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<button
											onclick={() => handleViewCustomer(customer.id)}
											class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
											title="View"
										>
											<Eye class="w-4 h-4" />
										</button>
										<button
											onclick={() => handleEditCustomer(customer.id)}
											class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
											title="Edit"
										>
											<Edit class="w-4 h-4" />
										</button>
										<button
											onclick={() => handleDeleteCustomer(customer.id)}
											class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Delete"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</Card>


</div>
*/