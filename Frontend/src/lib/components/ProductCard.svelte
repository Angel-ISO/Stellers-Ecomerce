<script lang="ts">
	import type { ProductOutput } from '$lib/models/Products/ProductType';
	import { formatCurrency } from '$lib/lib/utils';
	import { Star, ShoppingCart } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/stores/auth.svelte';

	interface Props {
		product: ProductOutput;
		onAddToCart?: (productId: string) => void;
	}

	let { product, onAddToCart }: Props = $props();

	function handleAddToCart() {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}
		if (onAddToCart) {
			onAddToCart(product.id);
		}
	}

	function handleViewProduct() {
		goto(`/productos/${product.id}`);
	}
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
	<div class="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer" onclick={handleViewProduct}>
		{#if product.imageUrls && product.imageUrls.length > 0}
			<img
				src={product.imageUrls[0]}
				alt={product.name}
				class="w-full h-full object-cover hover:scale-105 transition-transform"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
				}}
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center bg-gray-200">
				<span class="text-gray-400 text-sm">Sin imagen</span>
			</div>
		{/if}
		{#if !product.isActive || product.stock === 0}
			<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
				{product.stock === 0 ? 'Agotado' : 'Inactivo'}
			</div>
		{/if}
	</div>
	<div class="p-4">
		<h3 class="font-semibold text-gray-900 mb-1 truncate cursor-pointer" onclick={handleViewProduct}>
			{product.name}
		</h3>
		{#if product.description}
			<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
		{/if}

		<div class="flex items-baseline gap-2 mb-3">
			<span class="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
		</div>

		<div class="flex items-center justify-between">
			<p class="text-sm text-gray-600">
				{product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
			</p>
			<button
				onclick={handleAddToCart}
				disabled={!product.isActive || product.stock === 0}
				class="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
			>
				<ShoppingCart class="w-4 h-4" />
				Agregar
			</button>
		</div>
	</div>
</div>
