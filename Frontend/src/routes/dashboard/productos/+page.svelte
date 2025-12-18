<script lang="ts">
	import DashboardHeader from '../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { createProductsViewModel } from '$lib/viewmodels/Products/products.viewmodel.svelte';
	import { formatCurrency } from '$lib/lib/utils';
	import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/stores/auth.svelte';

	const viewModel = createProductsViewModel();

	onMount(() => {
		viewModel.loadProducts();
	});

	function handleCreateProduct() {
		goto('/dashboard/productos/crear');
	}

	async function handleEditProduct(productId: string) {
		const canEdit = await authState.canEditProduct(productId);
		if (!canEdit) {
			goto('/unauthorized');
			return;
		}
		goto(`/dashboard/productos/editar/${productId}`);
	}

	async function handleDeleteProduct(productId: string) {
		const canEdit = await authState.canEditProduct(productId);
		if (!canEdit) {
			goto('/unauthorized');
			return;
		}
		if (confirm('Are you sure you want to delete this product?')) {
			viewModel.deleteProduct(productId);
		}
	}

	function handleViewProduct(productId: string) {
		goto(`/dashboard/productos/${productId}`);
	}
</script>

<DashboardHeader title="Productos" subtitle="Manage your product catalog">
	{#snippet actions()}
		{#if authState.isSeller()}
			<Button variant="default" onclick={handleCreateProduct}>
				<Plus class="w-4 h-4 mr-2" />
				Add Product
			</Button>
		{/if}
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	<!-- Search and Filters -->
	<Card class="p-6">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
				<Input
					bind:value={viewModel.searchQuery}
					placeholder="Search products by name or description..."
					class="pl-10"
				/>
			</div>
			<div class="flex gap-2">
				<Button variant="outline">
					<Filter class="w-4 h-4 mr-2" />
					Filters
				</Button>
			</div>
		</div>

		<!-- Category Filter -->
		<div class="mt-4 flex flex-wrap gap-2">
			<button
				onclick={() => (viewModel.selectedCategory = null)}
				class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {viewModel.selectedCategory ===
				null
					? 'bg-cyan-500 text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				All Categories
			</button>
			{#each viewModel.categories() as category}
				<button
					onclick={() => (viewModel.selectedCategory = category ?? null)}
					class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {viewModel.selectedCategory ===
					category
						? 'bg-cyan-500 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					{category}
				</button>
			{/each}
		</div>

		<!-- Stats Summary -->
		<div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
				<p class="text-sm text-blue-900">Total Products</p>
				<p class="text-2xl font-bold text-blue-900">{viewModel.products.length}</p>
			</div>
			<div class="p-3 bg-green-50 rounded-lg border border-green-200">
				<p class="text-sm text-green-900">Active</p>
				<p class="text-2xl font-bold text-green-900">{viewModel.activeProducts()}</p>
			</div>
			<div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
				<p class="text-sm text-yellow-900">Low Stock</p>
				<p class="text-2xl font-bold text-yellow-900">{viewModel.lowStockProducts()}</p>
			</div>
			<div class="p-3 bg-red-50 rounded-lg border border-red-200">
				<p class="text-sm text-red-900">Out of Stock</p>
				<p class="text-2xl font-bold text-red-900">{viewModel.outOfStockProducts()}</p>
			</div>
		</div>
	</Card>

	<!-- Products Table -->
	<Card>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Product
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Category
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Price
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Stock
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Sales
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#if viewModel.filteredProducts().length === 0}
						<tr>
							<td colspan="7" class="px-6 py-8 text-center text-gray-500">
								No products found. Try adjusting your search or filters.
							</td>
						</tr>
					{:else}
						{#each viewModel.filteredProducts() as product}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-3">
										<img
											src={product.imageUrls[0] || '/placeholder-product.jpg'}
											alt={product.name}
											class="w-12 h-12 rounded-lg object-cover"
										/>
										<div class="min-w-0">
											<p class="font-medium text-gray-900 truncate">{product.name}</p>
											<p class="text-sm text-gray-600 truncate">{product.description || 'No description'}</p>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-gray-600">{product.categoryId || 'Uncategorized'}</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<p class="font-semibold text-gray-900">{formatCurrency(product.price)}</p>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-gray-600">{product.stock}</td>
								<td class="px-6 py-4 whitespace-nowrap text-gray-600">-</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<Badge variant={viewModel.getProductStatusColor(product)}>
										{viewModel.getProductStatusLabel(product)}
									</Badge>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<button
											onclick={() => handleViewProduct(product.id)}
											class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
											title="View"
										>
											<Eye class="w-4 h-4" />
										</button>
										{#if authState.isSeller()}
											{#await authState.canEditProduct(product.id) then canEdit}
												{#if canEdit}
													<button
														onclick={() => handleEditProduct(product.id)}
														class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
														title="Edit"
													>
														<Edit class="w-4 h-4" />
													</button>
													<button
														onclick={() => handleDeleteProduct(product.id)}
														class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title="Delete"
													>
														<Trash2 class="w-4 h-4" />
													</button>
												{/if}
											{/await}
										{/if}
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
