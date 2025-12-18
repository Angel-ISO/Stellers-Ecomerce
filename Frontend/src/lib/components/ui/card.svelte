<script lang="ts">
	import { cn } from '$lib/lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className, children, ...props }: Props = $props();
</script>

<div
	class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
	{...props}
>
	{#if children}
		{@render children()}
	{/if}
</div>
