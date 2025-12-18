<script lang="ts">
	import { ShoppingCart } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cartStore } from '$lib/stores/cart.svelte';

	function goToCart() {
		goto('/carrito');
	}
</script>

<button
	onclick={goToCart}
	class="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
>
	<ShoppingCart class="w-6 h-6" />
	<span class="font-medium">Carrito</span>
	{#if cartStore.totalItems > 0}
		<span
			class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
		>
			{cartStore.totalItems}
		</span>
	{/if}
</button>

