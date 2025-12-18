<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import HeroCarousel from '$lib/components/HeroCarousel.svelte';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import TopCategories from '$lib/components/TopCategories.svelte';
</script>

<div class="min-h-screen bg-gray-50">
	<Header />
	<Navigation />
	<main>
		<HeroCarousel />
		<div class="py-8">
			<div class="container mx-auto px-4 mb-6">
				<h2 class="text-3xl font-bold text-gray-900 mb-2">Productos Destacados</h2>
				<p class="text-gray-600">Descubre nuestra selección de productos</p>
			</div>
			<ProductGrid />
		</div>
		<TopCategories />
	</main>
</div>
