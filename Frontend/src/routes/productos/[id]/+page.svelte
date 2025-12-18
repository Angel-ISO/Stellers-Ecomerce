<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { ArrowLeft, ShoppingCart, Package, DollarSign, Store } from 'lucide-svelte';
	import productService from '$lib/services/Products/Product.service';
	import storeService from '$lib/services/Store/Store.service';
	import type { ProductOutput } from '$lib/models/Products/ProductType';
	import { formatCurrency, formatDate } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import ProductReview from '$lib/components/ProductReview.svelte';
	import ChatModal from '$lib/components/ChatModal.svelte';

	const productId = $page.params.id;

	let product = $state<ProductOutput | null>(null);
	let store = $state<any>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let currentImageIndex = $state(0);
	let quantity = $state(1);
	let chatModalOpen = $state(false);

	onMount(async () => {
		await loadProduct();
	});

	async function loadProduct() {
		if (!productId) {
			error = 'ID de producto no válido';
			isLoading = false;
			return;
		}

		isLoading = true;
		error = null;
		try {
			const response: any = await productService.getProduct(productId);

			if (response?.data?.data) {
				product = response.data.data;
			} else if (response?.data) {
				product = response.data;
			} else if (response) {
				product = response;
			} else {
				error = 'Producto no encontrado';
			}

			if (product?.storeId) {
				const storeResponse: any = await storeService.getStore(product.storeId);
				store = storeResponse?.data || storeResponse;
			}
		} catch (err) {
			console.error('Error loading product:', err);
			error = 'Error al cargar el producto';
		} finally {
			isLoading = false;
		}
	}

	function handleAddToCart() {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}

		if (!product) return;

		try {
			cartStore.addItem(product, quantity);
			alert('Producto agregado al carrito');
		} catch (err: any) {
			alert(err.message || 'Error al agregar al carrito');
		}
	}

	function getStatusColor(): 'success' | 'destructive' | 'warning' | 'secondary' {
		if (!product) return 'secondary';
		if (!product.isActive) return 'secondary';
		if (product.stock === 0) return 'destructive';
		if (product.stock <= 10) return 'warning';
		return 'success';
	}

	function getStatusLabel(): string {
		if (!product) return '';
		if (!product.isActive) return 'Inactivo';
		if (product.stock === 0) return 'Agotado';
		if (product.stock <= 10) return 'Poco stock';
		return 'Disponible';
	}

	function openChat() {
		chatModalOpen = true;
	}

	function closeChat() {
		chatModalOpen = false;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-6">
		<Button variant="outline" onclick={() => goto('/')} class="mb-6">
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver
		</Button>

		{#if isLoading}
			<Card class="p-8">
				<div class="flex items-center justify-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
					<span class="ml-4 text-gray-600">Cargando producto...</span>
				</div>
			</Card>
		{:else if error}
			<Card class="p-8">
				<div class="text-center">
					<p class="text-red-500 text-lg mb-4">{error}</p>
					<Button onclick={() => goto('/')}>Volver al inicio</Button>
				</div>
			</Card>
		{:else if product}
			<div class="max-w-6xl mx-auto space-y-6">
				<Card class="p-6">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div class="space-y-4">
							<div class="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
								{#if product.imageUrls && product.imageUrls.length > 0}
									<img
										src={product.imageUrls[currentImageIndex]}
										alt={product.name}
										class="w-full h-full object-cover"
										onerror={(e) => {
											(e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
										}}
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<Package class="w-24 h-24 text-gray-400" />
									</div>
								{/if}
							</div>

							{#if product.imageUrls && product.imageUrls.length > 1}
								<div class="grid grid-cols-4 gap-2">
									{#each product.imageUrls as imageUrl, index}
										<button
											onclick={() => (currentImageIndex = index)}
											class="aspect-square rounded-lg overflow-hidden border-2 transition-all {currentImageIndex ===
											index
												? 'border-cyan-500'
												: 'border-gray-200 hover:border-gray-300'}"
										>
											<img
												src={imageUrl}
												alt={`${product.name} thumbnail ${index + 1}`}
												class="w-full h-full object-cover"
											/>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div class="space-y-6">
							<div>
								<div class="flex items-start justify-between mb-2">
									<h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>
									<Badge variant={getStatusColor()}>{getStatusLabel()}</Badge>
								</div>
								<p class="text-4xl font-bold text-cyan-600 mt-4">
									{formatCurrency(product.price)}
								</p>
							</div>

							{#if product.description}
								<div>
									<h3 class="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
									<p class="text-gray-600 leading-relaxed">{product.description}</p>
								</div>
							{/if}

							<div class="grid grid-cols-2 gap-4">
								<div class="p-4 bg-green-50 rounded-lg border border-green-200">
									<div class="flex items-center gap-2 mb-1">
										<Store class="w-4 h-4 text-green-600" />
										<span class="text-sm text-green-900 font-medium">Tienda</span>
									</div>
									{#if store}
										<p class="text-lg font-bold text-green-900">{store.name}</p>
									{/if}
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
									<div class="flex items-center gap-2 mb-1">
										<Package class="w-4 h-4 text-blue-600" />
										<span class="text-sm text-blue-900 font-medium">Stock</span>
									</div>
									<p class="text-2xl font-bold text-blue-900">{product.stock}</p>
								</div>

								<div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
									<div class="flex items-center gap-2 mb-1">
										<DollarSign class="w-4 h-4 text-purple-600" />
										<span class="text-sm text-purple-900 font-medium">Precio</span>
									</div>
									<p class="text-2xl font-bold text-purple-900">{formatCurrency(product.price)}</p>
								</div>
							</div>

							{#if product.isActive && product.stock > 0}
								<div class="flex items-center gap-4 pt-4 border-t">
									<label for="quantity-input" class="text-sm font-medium text-gray-700">Cantidad:</label>
									<input
										id="quantity-input"
										type="number"
										min="1"
										max={product.stock}
										bind:value={quantity}
										class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
									/>
									<Button variant="default" onclick={handleAddToCart} class="flex-1">
										<ShoppingCart class="w-4 h-4 mr-2" />
										Agregar al Carrito
									</Button>
								</div>
							{/if}

							{#if store && store.ownerId}
								<div class="pt-4 border-t">
									<button
										onclick={openChat}
										class="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors cursor-pointer"
									>
										<Store class="w-4 h-4" />
										<span>Contactar con el vendedor</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				</Card>

				{#if product}
					<ProductReview productId={product.id} />
				{/if}
			</div>
		{/if}

		{#if product && store && store.ownerId}
			<ChatModal
				isOpen={chatModalOpen}
				productId={product.id}
				sellerId={store.ownerId}
				onClose={closeChat}
			/>
		{/if}
	</div>
</div>

