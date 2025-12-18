<script lang="ts">
	import { toastStore } from '$lib/stores/toast';
	import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-svelte';

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return AlertCircle;
			case 'warning':
				return AlertTriangle;
			case 'info':
			default:
				return Info;
		}
	}

	function getStyles(type: string) {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'error':
				return 'bg-red-50 border-red-200 text-red-800';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			case 'info':
			default:
				return 'bg-blue-50 border-blue-200 text-blue-800';
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
	{#each $toastStore as toast (toast.id)}
		<div
			class="flex items-center p-4 rounded-lg border shadow-lg transition-all duration-300 animate-in slide-in-from-right-2 {getStyles(toast.type)}"
			role="alert"
		>
			<svelte:component this={getIcon(toast.type)} class="w-5 h-5 mr-3 flex-shrink-0" />
			<p class="text-sm font-medium flex-1">{toast.message}</p>
			{#if toast.dismissible}
				<button
					onclick={() => toastStore.removeToast(toast.id)}
					class="ml-3 flex-shrink-0 hover:opacity-75 transition-opacity"
					aria-label="Cerrar notificación"
				>
					<X class="w-4 h-4" />
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in-from-right-2 {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-in {
		animation: slide-in-from-right-2 0.3s ease-out;
	}
</style>