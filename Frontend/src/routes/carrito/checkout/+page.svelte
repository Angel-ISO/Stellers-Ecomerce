<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowLeft, CheckCircle, XCircle } from 'lucide-svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatCurrency } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';
	import orderService from '$lib/services/Orders/Order.service';

	let isProcessing = $state(false);
	let orderCreated = $state(false);
	let error = $state<string | null>(null);
	let orderId = $state<string | null>(null);

	onMount(() => {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}

		if (cartStore.isEmpty) {
			goto('/carrito');
			return;
		}

		const sellers = new Set(cartStore.items.map((item) => item.product.storeId));
		if (sellers.size > 1) {
			alert('Todos los productos deben ser del mismo vendedor. Por favor, separa tu pedido.');
			goto('/carrito');
		}
	});

	async function handleCreateOrder() {
		isProcessing = true;
		error = null;

		try {
			const orderItems = cartStore.items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity
			}));

			const response: any = await orderService.createOrder({ items: orderItems });
			const order = response?.data || response;

			orderId = order.id;
			orderCreated = true;
			cartStore.clear();
		} catch (err: any) {
			console.error('Error creating order:', err);
			error = err.message || 'Error al crear el pedido. Por favor, intenta nuevamente.';
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-6">
		<Button variant="outline" onclick={() => goto('/carrito')} class="mb-6">
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver al Carrito
		</Button>

		{#if orderCreated}
			<Card class="max-w-2xl mx-auto p-8">
				<div class="text-center">
					<CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
					<h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pedido Creado Exitosamente!</h1>
					<p class="text-gray-600 mb-4">
						Tu pedido ha sido creado con el ID: <span class="font-mono font-semibold">{orderId}</span>
					</p>
					<div class="flex gap-4 justify-center">
						<Button variant="default" onclick={() => goto('/dashboard/historial')}>
							Ver Mis Pedidos
						</Button>
						<Button variant="outline" onclick={() => goto('/')}>
							Seguir Comprando
						</Button>
					</div>
				</div>
			</Card>
		{:else}
			<div class="max-w-4xl mx-auto space-y-6">
				<Card class="p-6">
					<h1 class="text-2xl font-bold text-gray-900 mb-6">Confirmar Pedido</h1>

					<div class="space-y-4 mb-6">
						<h2 class="text-lg font-semibold text-gray-900">Resumen del Pedido</h2>
						{#each cartStore.items as item}
							<div class="flex justify-between items-center py-2 border-b">
								<div>
									<p class="font-medium text-gray-900">{item.product.name}</p>
									<p class="text-sm text-gray-600">
										Cantidad: {item.quantity} × {formatCurrency(item.unitPrice)}
									</p>
								</div>
								<p class="font-semibold text-gray-900">
									{formatCurrency(item.unitPrice * item.quantity)}
								</p>
							</div>
						{/each}

						<div class="pt-4 border-t">
							<div class="flex justify-between text-lg font-bold text-gray-900">
								<span>Total</span>
								<span>{formatCurrency(cartStore.totalPrice)}</span>
							</div>
						</div>
					</div>

					{#if error}
						<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
							<div class="flex items-center gap-2 text-red-800">
								<XCircle class="w-5 h-5" />
								<p>{error}</p>
							</div>
						</div>
					{/if}

					<div class="flex gap-4">
						<Button
							variant="default"
							onclick={handleCreateOrder}
							disabled={isProcessing}
							class="flex-1"
						>
							{isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
						</Button>
						<Button variant="outline" onclick={() => goto('/carrito')} disabled={isProcessing}>
							Cancelar
						</Button>
					</div>
				</Card>
			</div>
		{/if}
	</div>
</div>

