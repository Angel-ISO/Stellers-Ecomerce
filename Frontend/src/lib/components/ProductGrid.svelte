<script lang="ts">
	import { onMount } from 'svelte';
	import ProductCard from './ProductCard.svelte';
	import type { ProductOutput } from '$lib/models/Products/ProductType';
	import productService from '$lib/services/Products/Product.service';
	import { cartStore } from '$lib/stores/cart.svelte';

	let products = $state<ProductOutput[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadProducts();
	});

	async function loadProducts() {
		isLoading = true;
		error = null;
		try {
			const response: any = await productService.getProducts();
			let productsData: ProductOutput[] = [];

			if (response?.data?.data && Array.isArray(response.data.data)) {
				productsData = response.data.data;
			} else if (response?.data && Array.isArray(response.data)) {
				productsData = response.data;
			} else if (Array.isArray(response)) {
				productsData = response;
			}

			products = productsData.filter((p) => p.isActive && p.stock > 0);
		} catch (err) {
			console.error('Error loading products:', err);
			error = 'Error al cargar productos';
		} finally {
			isLoading = false;
		}
	}

	function handleAddToCart(productId: string) {
		const product = products.find((p) => p.id === productId);
		if (product) {
			cartStore.addItem(product);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
			<span class="ml-4 text-gray-600">Cargando productos...</span>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<p class="text-red-500 mb-4">{error}</p>
			<button
				onclick={loadProducts}
				class="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
			>
				Reintentar
			</button>
		</div>
	{:else if products.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-600 text-lg">No hay productos disponibles</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
			{#each products as product}
				<ProductCard {product} onAddToCart={handleAddToCart} />
			{/each}
		</div>
	{/if}
</div>

