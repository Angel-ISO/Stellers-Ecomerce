<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	const iconMap = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertCircle,
		info: Info
	};

	const colorMap = {
		success: {
			bg: 'bg-green-50 border-green-200',
			icon: 'text-green-600',
			text: 'text-green-900',
			button: 'hover:bg-green-100 text-green-600'
		},
		error: {
			bg: 'bg-red-50 border-red-200',
			icon: 'text-red-600',
			text: 'text-red-900',
			button: 'hover:bg-red-100 text-red-600'
		},
		warning: {
			bg: 'bg-yellow-50 border-yellow-200',
			icon: 'text-yellow-600',
			text: 'text-yellow-900',
			button: 'hover:bg-yellow-100 text-yellow-600'
		},
		info: {
			bg: 'bg-blue-50 border-blue-200',
			icon: 'text-blue-600',
			text: 'text-blue-900',
			button: 'hover:bg-blue-100 text-blue-600'
		}
	};
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
	{#each toastStore.toasts as toast (toast.id)}
		{@const colors = colorMap[toast.type]}
		{@const Icon = iconMap[toast.type]}
		<div
			in:fly={{ x: 300, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="flex items-start gap-3 p-4 rounded-lg shadow-lg border {colors.bg} backdrop-blur-sm"
			role="alert"
		>
			<Icon class="w-5 h-5 {colors.icon} flex-shrink-0 mt-0.5" />
			<p class="flex-1 text-sm font-medium {colors.text}">
				{toast.message}
			</p>
			<button
				onclick={() => toastStore.remove(toast.id)}
				class="flex-shrink-0 rounded-md p-1 transition-colors {colors.button}"
				aria-label="Cerrar"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
