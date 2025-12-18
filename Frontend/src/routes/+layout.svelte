<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { authState } from '$lib/stores/auth.svelte';
 	import ChatBubble from '$lib/components/ChatBubble.svelte';
 	import Toasts from '$lib/components/Toasts.svelte';

	let { children } = $props();

	onMount(() => {
		authState.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<!-- Global Chat Bubble, visible when user is authenticated -->
<ChatBubble />

<!-- Global Toast Notifications -->
<Toasts />
