<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatCurrency } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';
	import productService from '$lib/services/Products/Product.service';

	let isUpdating = $state(false);

	async function updateProductStock(item: any) {
		try {
			const product = await productService.getProduct(item.productId);
			const productData = product?.data || product;
			item.product = productData;
		} catch (error) {
			console.error('Error updating product:', error);
		}
	}

	async function validateCart() {
		isUpdating = true;
		try {
			for (const item of cartStore.items) {
				await updateProductStock(item);
				if (item.quantity > item.product.stock) {
					if (item.product.stock === 0) {
						cartStore.removeItem(item.productId);
						alert(`${item.product.name} ya no está disponible y fue removido del carrito`);
					} else {
						cartStore.updateQuantity(item.productId, item.product.stock);
						alert(
							`${item.product.name} solo tiene ${item.product.stock} unidades disponibles. La cantidad fue ajustada.`
						);
					}
				}
			}
		} finally {
			isUpdating = false;
		}
	}

	onMount(() => {
		if (!authState.isAuthenticated) {
			goto('/auth');
		} else {
			validateCart();
		}
	});

	function handleUpdateQuantity(productId: string, newQuantity: number) {
		try {
			cartStore.updateQuantity(productId, newQuantity);
		} catch (error: any) {
			alert(error.message || 'Error al actualizar cantidad');
		}
	}

	function handleRemoveItem(productId: string) {
		if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
			cartStore.removeItem(productId);
		}
	}

	function handleCheckout() {
		if (cartStore.isEmpty) {
			alert('El carrito está vacío');
			return;
		}

		const sellers = new Set(cartStore.items.map((item) => item.product.storeId));
		if (sellers.size > 1) {
			alert('Todos los productos deben ser del mismo vendedor. Por favor, separa tu pedido.');
			return;
		}

		goto('/carrito/checkout');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-6">
		<div class="flex items-center gap-4 mb-6">
			<Button variant="outline" onclick={() => goto('/')}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Continuar Comprando
			</Button>
			<h1 class="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
		</div>

		{#if cartStore.isEmpty}
			<Card class="p-12">
				<div class="text-center">
					<ShoppingCart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h2 class="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
					<p class="text-gray-600 mb-6">Agrega productos para comenzar</p>
					<Button variant="default" onclick={() => goto('/')}>
						Explorar Productos
					</Button>
				</div>
			</Card>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div class="lg:col-span-2 space-y-4">
					{#each cartStore.items as item}
						<Card class="p-6">
							<div class="flex gap-4">
								<div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
									{#if item.product.imageUrls && item.product.imageUrls.length > 0}
										<img
											src={item.product.imageUrls[0]}
											alt={item.product.name}
											class="w-full h-full object-cover"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
											Sin imagen
										</div>
									{/if}
								</div>

								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
									<p class="text-sm text-gray-600 mb-2">{formatCurrency(item.unitPrice)} c/u</p>
									<p class="text-sm text-gray-500">Stock disponible: {item.product.stock}</p>

									<div class="flex items-center gap-4 mt-4">
										<div class="flex items-center gap-2">
											<button
												onclick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
												disabled={item.quantity <= 1}
												class="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Minus class="w-4 h-4" />
											</button>
											<span class="w-12 text-center font-medium">{item.quantity}</span>
											<button
												onclick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
												disabled={item.quantity >= item.product.stock}
												class="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Plus class="w-4 h-4" />
											</button>
										</div>

										<button
											onclick={() => handleRemoveItem(item.productId)}
											class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Eliminar"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</div>

								<div class="text-right">
									<p class="text-lg font-bold text-gray-900">
										{formatCurrency(item.unitPrice * item.quantity)}
									</p>
								</div>
							</div>
						</Card>
					{/each}
				</div>

				<div class="lg:col-span-1">
					<Card class="p-6 sticky top-6">
						<h2 class="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h2>

						<div class="space-y-3 mb-4">
							<div class="flex justify-between text-gray-600">
								<span>Subtotal ({cartStore.totalItems} {cartStore.totalItems === 1 ? 'item' : 'items'})</span>
								<span>{formatCurrency(cartStore.totalPrice)}</span>
							</div>
							<div class="border-t pt-3">
								<div class="flex justify-between text-lg font-bold text-gray-900">
									<span>Total</span>
									<span>{formatCurrency(cartStore.totalPrice)}</span>
								</div>
							</div>
						</div>

						<Button variant="default" onclick={handleCheckout} class="w-full" disabled={isUpdating}>
							{isUpdating ? 'Validando...' : 'Proceder al Pago'}
						</Button>
					</Card>
				</div>
			</div>
		{/if}
	</div>
</div>

