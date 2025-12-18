<script lang="ts">
	import { cn } from '$lib/lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		src?: string;
		alt?: string;
		fallback?: string;
		class?: string;
	}

	let { src, alt = '', fallback = '??', class: className, ...props }: Props = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);

	function handleImageLoad() {
		imageLoaded = true;
	}

	function handleImageError() {
		imageError = true;
	}
</script>

<div
	class={cn(
		'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
		className
	)}
	{...props}
>
	{#if src && !imageError}
		<img
			{src}
			{alt}
			class="aspect-square h-full w-full object-cover"
			onload={handleImageLoad}
			onerror={handleImageError}
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
			{fallback}
		</div>
	{/if}
</div>
