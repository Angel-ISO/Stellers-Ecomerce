<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	let currentIndex = $state(0);

	const brands = [
		{
			name: 'IPHONE',
			logoImage: 'https://picsum.photos/seed/applelogo/100/100',
			bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
			textColor: 'text-white',
			discount: 'UP to 80% OFF',
			productImage: 'https://picsum.photos/seed/iphoneproduct/250/250'
		},
		{
			name: 'REALME',
			logoImage: 'https://picsum.photos/seed/realmelogo/100/100',
			bgColor: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
			textColor: 'text-gray-900',
			discount: 'UP to 80% OFF',
			productImage: 'https://picsum.photos/seed/realmeproduct/250/250'
		},
		{
			name: 'XIAOMI',
			logoImage: 'https://picsum.photos/seed/xiaomilogo/100/100',
			bgColor: 'bg-gradient-to-br from-orange-300 to-orange-400',
			textColor: 'text-white',
			discount: 'UP to 80% OFF',
			productImage: 'https://picsum.photos/seed/xiaomiproduct/250/250'
		}
	];

	const totalSlides = brands.length;

	function nextSlide() {
		currentIndex = (currentIndex + 1) % totalSlides;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}
</script>

<section class="container mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">
			Top <span class="text-cyan-500">Electronics Brands</span>
		</h2>
		<a
			href="/brands"
			class="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 font-medium"
		>
			View All
			<ChevronRight class="w-5 h-5" />
		</a>
	</div>

	<div class="relative">
		<div class="overflow-hidden">
			<div
				class="flex transition-transform duration-500 ease-in-out gap-4"
				style="transform: translateX(-{currentIndex * 33.33}%)"
			>
				{#each brands as brand}
					<div class="flex-shrink-0 w-[calc(33.33%-1rem)]">
						<div
							class="{brand.bgColor} rounded-2xl p-8 flex items-center justify-between min-h-[280px] relative overflow-hidden"
						>
							<!-- Brand info -->
							<div class="{brand.textColor} z-10 flex-1">
								<div class="text-xs font-semibold mb-2 uppercase tracking-wider opacity-75">
									{brand.name}
								</div>
								<div class="mb-4">
									<img
										src={brand.logoImage}
										alt="{brand.name} logo"
										class="w-20 h-20 object-contain rounded-xl bg-white/10 p-2"
									/>
								</div>
								<p class="text-xl font-bold">{brand.discount}</p>
							</div>

							<div class="flex-1 flex items-center justify-center z-10">
								<img
									src={brand.productImage}
									alt="{brand.name} product"
									class="w-48 h-48 object-cover rounded-lg shadow-lg"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Dots indicator -->
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<div class="flex justify-center gap-2 mt-6">
			{#each brands as _, index}
				<button
					onclick={() => goToSlide(index)}
					class="w-2 h-2 rounded-full transition-all {index === currentIndex
						? 'bg-cyan-500 w-8'
						: 'bg-gray-300 hover:bg-gray-400'}"
				></button>
			{/each}
		</div>
	</div>
</section>
