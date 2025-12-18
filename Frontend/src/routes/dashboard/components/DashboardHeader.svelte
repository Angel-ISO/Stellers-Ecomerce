<script lang="ts">
	import { cn } from '$lib/lib/utils';
	import { Menu } from 'lucide-svelte';

	interface Props {
		title: string;
		subtitle?: string;
		class?: string;
		actions?: import('svelte').Snippet;
		onMenuClick?: () => void;
	}

	let { title, subtitle, class: className, actions, onMenuClick }: Props = $props();
</script>

<header class={cn('bg-white border-b border-gray-200 sticky top-0 z-30', className)}>
	<div class="px-6 py-4 flex items-center justify-between gap-4">
		<div class="flex items-center gap-4 flex-1 min-w-0">
			{#if onMenuClick}
				<button
					onclick={onMenuClick}
					class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<Menu class="w-6 h-6" />
				</button>
			{/if}
			<div class="min-w-0">
				<h1 class="text-2xl font-bold text-gray-900 truncate">{title}</h1>
				{#if subtitle}
					<p class="text-sm text-gray-600 truncate">{subtitle}</p>
				{/if}
			</div>
		</div>
		{#if actions}
			<div class="flex items-center gap-2">
				{@render actions()}
			</div>
		{/if}
	</div>
</header>
