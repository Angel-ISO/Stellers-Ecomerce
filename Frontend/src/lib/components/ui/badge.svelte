<script lang="ts">
	import { cn } from '$lib/lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', class: className, children, ...props }: Props = $props();

	const variants = {
		default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
		outline: 'text-foreground',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
		success: 'border-transparent bg-green-100 text-green-800',
		warning: 'border-transparent bg-yellow-100 text-yellow-800'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants[variant],
		className
	)}
	{...props}
>
	{#if children}
		{@render children()}
	{/if}
</div>
