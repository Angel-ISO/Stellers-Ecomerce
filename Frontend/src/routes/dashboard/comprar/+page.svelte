<script lang="ts">
    import DashboardHeader from '../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
    import { createProductsViewModel } from '$lib/viewmodels/Products/products.viewmodel.svelte';
	import { formatCurrency } from '$lib/lib/utils';
	import { Search, ShoppingCart, Star, Filter } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

    const viewModel = createProductsViewModel();

	function addToCart(productId: string) {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}
		console.log('Adding to cart:', productId);
		// TODO: Implement cart functionality
	}
</script>

<DashboardHeader title="Comprar" subtitle="Browse and purchase products">
	{#snippet actions()}
		<Button variant="default">
			<ShoppingCart class="w-4 h-4 mr-2" />
			View Cart
		</Button>
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
					placeholder="Search products..."
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
				All
			</button>
			{#each viewModel.categories() as category}
				<button
					onclick={() => (viewModel.selectedCategory = category)}
					class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {viewModel.selectedCategory ===
					category
						? 'bg-cyan-500 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					{category}
				</button>
			{/each}
		</div>
	</Card>

	<!-- Products Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
		{#each viewModel.filteredProducts() as product}
			<Card class="overflow-hidden hover:shadow-lg transition-shadow">
				<div class="relative aspect-square overflow-hidden bg-gray-100">
					<img
						src={product.images[0]}
						alt={product.name}
						class="w-full h-full object-cover hover:scale-105 transition-transform"
					/>
					{#if product.discount}
						<Badge
							variant="destructive"
							class="absolute top-2 left-2"
						>
							{product.discount}% OFF
						</Badge>
					{/if}
					<Badge
						variant={viewModel.getProductStatusColor(product.status)}
						class="absolute top-2 right-2"
					>
						{viewModel.getProductStatusLabel(product.status)}
					</Badge>
				</div>
				<div class="p-4">
					<h3 class="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
					<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

					<!-- Rating -->
					<div class="flex items-center gap-1 mb-3">
						<div class="flex items-center gap-0.5">
							{#each Array(5) as _, i}
								<Star
									class="w-4 h-4 {i < Math.floor(product.rating)
										? 'fill-yellow-400 text-yellow-400'
										: 'text-gray-300'}"
								/>
							{/each}
						</div>
						<span class="text-sm text-gray-600">({product.reviews})</span>
					</div>

					<!-- Price -->
					<div class="flex items-baseline gap-2 mb-3">
						<span class="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
						{#if product.originalPrice}
							<span class="text-sm text-gray-500 line-through">
								{formatCurrency(product.originalPrice)}
							</span>
						{/if}
					</div>

					<!-- Stock Info -->
					<p class="text-sm text-gray-600 mb-3">
						{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
					</p>

					<!-- Actions -->
					<Button
						onclick={() => addToCart(product.id)}
						disabled={product.status === 'out_of_stock'}
						class="w-full"
					>
						{#if product.status === 'out_of_stock'}
							Out of Stock
						{:else}
							Add to Cart
						{/if}
					</Button>
				</div>
			</Card>
		{/each}
	</div>

	{#if viewModel.filteredProducts().length === 0}
		<Card class="p-12">
			<div class="text-center">
				<ShoppingCart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
				<h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
				<p class="text-gray-600">Try adjusting your search or filters</p>
			</div>
		</Card>
	{/if}
</div>
