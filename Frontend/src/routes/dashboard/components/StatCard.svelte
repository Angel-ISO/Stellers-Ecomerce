<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import { cn } from '$lib/lib/utils';
	import type { ComponentType } from 'svelte';
	import { TrendingUp, TrendingDown } from 'lucide-svelte';

	interface Props {
		title: string;
		value: string;
		change?: string;
		changeType?: 'positive' | 'negative' | 'neutral';
		icon: ComponentType;
		iconColor?: string;
		class?: string;
	}

	let {
		title,
		value,
		change,
		changeType = 'neutral',
		icon: Icon,
		iconColor = 'bg-blue-500',
		class: className
	}: Props = $props();
</script>

<Card class={cn('p-6', className)}>
	<div class="flex items-center justify-between mb-4">
		<div class={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconColor)}>
			<Icon class="w-6 h-6 text-white" />
		</div>
		{#if change}
			<div
				class={cn(
					'flex items-center gap-1 text-sm font-semibold',
					changeType === 'positive' && 'text-green-600',
					changeType === 'negative' && 'text-red-600',
					changeType === 'neutral' && 'text-gray-600'
				)}
			>
				{#if changeType === 'positive'}
					<TrendingUp class="w-4 h-4" />
				{:else if changeType === 'negative'}
					<TrendingDown class="w-4 h-4" />
				{/if}
				{change}
			</div>
		{/if}
	</div>
	<h3 class="text-gray-600 text-sm mb-1">{title}</h3>
	<p class="text-2xl font-bold text-gray-900">{value}</p>
</Card>
