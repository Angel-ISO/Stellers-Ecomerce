<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';

	const categories = [
		{ name: 'Groceries', hasDropdown: true, active: true },
		{ name: 'Premium Fruits', hasDropdown: true },
		{ name: 'Home & Kitchen', hasDropdown: true },
		{ name: 'Fashion', hasDropdown: true },
		{ name: 'Electronics', hasDropdown: true },
		{ name: 'Beauty', hasDropdown: true },
		{ name: 'Home Improvement', hasDropdown: true },
		{ name: 'Sports, Toys & Luggage', hasDropdown: true }
	];
</script>

<nav class="bg-white border-b border-gray-200">
	<div class="container mx-auto px-4">
		<div class="flex items-center gap-1">
			{#each categories as category, index}
				<button
					class="px-4 py-3 text-sm font-medium transition-colors {category.active
						? 'bg-blue-600 text-white'
						: 'text-gray-700 hover:bg-gray-50'} {index === 0 ? 'rounded-l-lg' : ''} flex items-center gap-2"
				>
					{category.name}
					{#if category.hasDropdown}
						<ChevronDown class="w-4 h-4" />
					{/if}
				</button>
			{/each}
		</div>
	</div>
</nav>
