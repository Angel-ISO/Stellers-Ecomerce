<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	const categories = [
		{ name: 'Mobile', image: 'https://picsum.photos/seed/mobile/200/200', active: true },
		{ name: 'Cosmetics', image: 'https://picsum.photos/seed/cosmetics/200/200' },
		{ name: 'Electronics', image: 'https://picsum.photos/seed/electronics/200/200' },
		{ name: 'Furniture', image: 'https://picsum.photos/seed/furniture/200/200' },
		{ name: 'Watches', image: 'https://picsum.photos/seed/watches/200/200' },
		{ name: 'Decor', image: 'https://picsum.photos/seed/decor/200/200' },
		{ name: 'Accessories', image: 'https://picsum.photos/seed/accessories/200/200' }
	];
</script>

<section class="container mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">
			Shop From <span class="text-cyan-500">Top Categories</span>
		</h2>
		<a
			href="/categories"
			class="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 font-medium"
		>
			View All
			<ChevronRight class="w-5 h-5" />
		</a>
	</div>

	<div class="flex items-center justify-center gap-12 overflow-x-auto pb-4">
		{#each categories as category}
			<button class="flex flex-col items-center gap-3 flex-shrink-0 group">
				<div
					class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 transition-all group-hover:shadow-lg {category.active
						? 'ring-4 ring-cyan-500 ring-offset-2'
						: 'group-hover:ring-2 group-hover:ring-gray-300'}"
				>
					<img src={category.image} alt={category.name} class="w-full h-full object-cover" />
				</div>
				<span class="text-base font-medium text-gray-900">{category.name}</span>
			</button>
		{/each}
	</div>
</section>
