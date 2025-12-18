<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { AlertCircle } from 'lucide-svelte';
	import Button from './button.svelte';

	interface Props {
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger' | 'warning' | 'default';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		title = '¿Estás seguro?',
		message,
		confirmText = 'Confirmar',
		cancelText = 'Cancelar',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	const variantStyles = {
		danger: {
			icon: 'text-red-600',
			button: 'bg-red-600 hover:bg-red-700'
		},
		warning: {
			icon: 'text-yellow-600',
			button: 'bg-yellow-600 hover:bg-yellow-700'
		},
		default: {
			icon: 'text-cyan-600',
			button: 'bg-cyan-600 hover:bg-cyan-700'
		}
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
	onclick={onCancel}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
		transition:scale={{ duration: 200, start: 0.95 }}
		onclick={(e) => e.stopPropagation()}
		role="document"
	>
		<div class="flex items-start gap-4">
			<div
				class="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"
			>
				<AlertCircle class="w-6 h-6 {variantStyles[variant].icon}" />
			</div>
			<div class="flex-1 pt-1">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">
					{title}
				</h3>
				<p class="text-sm text-gray-600 leading-relaxed">
					{message}
				</p>
			</div>
		</div>

		<div class="flex gap-3 mt-6">
			<Button variant="outline" class="flex-1" onclick={onCancel}>
				{cancelText}
			</Button>
			<button
				onclick={onConfirm}
				class="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors {variantStyles[
					variant
				].button}"
			>
				{confirmText}
			</button>
		</div>
	</div>
</div>
