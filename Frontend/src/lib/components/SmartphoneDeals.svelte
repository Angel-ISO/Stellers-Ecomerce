<script lang="ts">
	import { ChevronRight, ChevronLeft } from 'lucide-svelte';
	import ProductCard from './ProductCard.svelte';
	import { onMount } from 'svelte';

	const smartphones = [
		{
			name: 'Galaxy S22 Ultra',
			price: 799,
			originalPrice: 1199,
			discount: 56,
			image: 'https://picsum.photos/seed/phone1/400/400'
		},
		{
			name: 'Galaxy M13 (4GB | 64 GB )',
			price: 149,
			originalPrice: 299,
			discount: 56,
			image: 'https://picsum.photos/seed/phone2/400/400'
		},
		{
			name: 'Galaxy M33 (4GB | 64 GB )',
			price: 249,
			originalPrice: 399,
			discount: 56,
			image: 'https://picsum.photos/seed/phone3/400/400'
		},
		{
			name: 'Galaxy M53 (4GB | 64 GB )',
			price: 399,
			originalPrice: 599,
			discount: 56,
			image: 'https://picsum.photos/seed/phone4/400/400'
		},
		{
			name: 'Galaxy S22 Ultra',
			price: 899,
			originalPrice: 1299,
			discount: 56,
			image: 'https://picsum.photos/seed/phone5/400/400'
		},
		{
			name: 'iPhone 14 Pro',
			price: 999,
			originalPrice: 1199,
			discount: 17,
			image: 'https://picsum.photos/seed/phone6/400/400'
		},
		{
			name: 'iPhone 13',
			price: 699,
			originalPrice: 899,
			discount: 22,
			image: 'https://picsum.photos/seed/phone7/400/400'
		},
		{
			name: 'Pixel 7 Pro',
			price: 649,
			originalPrice: 899,
			discount: 28,
			image: 'https://picsum.photos/seed/phone8/400/400'
		}
	];

	let carouselContainer: HTMLElement;
	let currentIndex = 0;
	let itemsPerView = 5;

	onMount(() => {
		updateItemsPerView();
		window.addEventListener('resize', updateItemsPerView);
		
		return () => {
			window.removeEventListener('resize', updateItemsPerView);
		};
	});

	function updateItemsPerView() {
		if (typeof window !== 'undefined') {
			if (window.innerWidth < 640) {
				itemsPerView = 1;
			} else if (window.innerWidth < 768) {
				itemsPerView = 2;
			} else if (window.innerWidth < 1024) {
				itemsPerView = 3;
			} else if (window.innerWidth < 1280) {
				itemsPerView = 4;
			} else {
				itemsPerView = 5;
			}
		}
	}

	function scrollToIndex(index: number) {
		if (carouselContainer) {
			const itemWidth = carouselContainer.scrollWidth / smartphones.length;
			carouselContainer.scrollTo({
				left: index * itemWidth,
				behavior: 'smooth'
			});
			currentIndex = index;
		}
	}

	function scrollLeft() {
		const newIndex = Math.max(0, currentIndex - itemsPerView);
		scrollToIndex(newIndex);
	}

	function scrollRight() {
		const maxIndex = Math.max(0, smartphones.length - itemsPerView);
		const newIndex = Math.min(maxIndex, currentIndex + itemsPerView);
		scrollToIndex(newIndex);
	}

	$: canScrollLeft = currentIndex > 0;
	$: canScrollRight = currentIndex < smartphones.length - itemsPerView;
</script>

<section class="container mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">
			Grab the best deal on <span class="text-cyan-500">Smartphones</span>
		</h2>
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<button
					on:click={scrollLeft}
					disabled={!canScrollLeft}
					class="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Previous items"
				>
					<ChevronLeft class="w-5 h-5" />
				</button>
				<button
					on:click={scrollRight}
					disabled={!canScrollRight}
					class="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Next items"
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>
			<a
				href="/smartphones"
				class="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 font-medium"
			>
				View All
				<ChevronRight class="w-5 h-5" />
			</a>
		</div>
	</div>
	<div class="relative">
		<div
			bind:this={carouselContainer}
			class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
			style="scrollbar-width: none; -ms-overflow-style: none;"
		>
			{#each smartphones as phone}
				<div class="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
					<ProductCard
						name={phone.name}
						price={phone.price}
						originalPrice={phone.originalPrice}
						discount={phone.discount}
						image={phone.image}
					/>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
