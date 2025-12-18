<script lang="ts">
	import ConfirmModal from './ConfirmModal.svelte';
	import { confirmStore } from '$lib/stores/confirm.svelte';
</script>

{#if confirmStore.isOpen}
	<ConfirmModal
		title={confirmStore.options.title}
		message={confirmStore.options.message}
		confirmText={confirmStore.options.confirmText}
		cancelText={confirmStore.options.cancelText}
		variant={confirmStore.options.variant}
		onConfirm={() => confirmStore.handleConfirm()}
		onCancel={() => confirmStore.handleCancel()}
	/>
{/if}
