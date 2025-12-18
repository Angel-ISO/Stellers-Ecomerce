<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let currentSlide = $state(0);
	const totalSlides = 6;

	function nextSlide() {
		currentSlide = (currentSlide + 1) % totalSlides;
	}

	function prevSlide() {
		currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
	}

	function goToSlide(index: number) {
		currentSlide = index;
	}
</script>

<section class="container mx-auto px-4 py-8">
	<div class="relative bg-gradient-to-r from-[#2C3E50] to-[#34495E] rounded-2xl overflow-hidden">
		<!-- Slide content -->
		<div class="relative px-16 py-12 flex items-center justify-between min-h-[400px]">
			<!-- Left content -->
			<div class="text-white max-w-xl z-10">
				<p class="text-lg mb-2">Best Deal Online on smart watches</p>
				<h1 class="text-5xl font-bold mb-4">
					SMART WEARABLE<span class="text-cyan-400">.</span>
				</h1>
				<p class="text-2xl font-semibold">UP to 80% OFF</p>
			</div>
			<div class="relative z-10">
				<img
					src="https://picsum.photos/seed/smartwatch/320/320"
					alt="Smart Watch"
					class="w-80 h-80 object-contain rounded-3xl shadow-2xl"
				/>
			</div>
		</div>
		<button
			onclick={prevSlide}
			class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors z-20"
		>
			<ChevronLeft class="w-6 h-6 text-gray-700" />
		</button>
		<button
			onclick={nextSlide}
			class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors z-20"
		>
			<ChevronRight class="w-6 h-6 text-gray-700" />
		</button>
		<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
			{#each Array(totalSlides) as _, index}
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					onclick={() => goToSlide(index)}
					class="w-2 h-2 rounded-full transition-all {index === currentSlide
						? 'bg-white w-8'
						: 'bg-white/50 hover:bg-white/75'}"
				></button>
			{/each}
		</div>
	</div>
</section>
