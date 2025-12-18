<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from './components/Sidebar.svelte';
	import SystemStatus from './components/SystemStatus.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import GlobalConfirm from '$lib/components/ui/GlobalConfirm.svelte';
	import { cn } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';
	import AuthService from '$lib/services/Auth/Auth.service';
	import { startInactivityTimer, stopInactivityTimer } from '$lib/utils/inactivity';

	let { children } = $props();
	let sidebarCollapsed = $state(false);
	let isCheckingAuth = $state(true);

	onMount(() => {
		authState.initialize();
		if (!AuthService.isAuthenticated()) {
			goto('/auth');
			return;
		}

		isCheckingAuth = false;
		startInactivityTimer();
	});

	onDestroy(() => {
		stopInactivityTimer();
	});
</script>

{#if isCheckingAuth}
	<!-- Loading state while checking authentication -->
	<div class="min-h-screen bg-gray-50 flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50">
		<Sidebar bind:collapsed={sidebarCollapsed} />

		<main class={cn('transition-all duration-300 relative', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
			<div class="absolute top-4 right-4 z-50">
				<SystemStatus />
			</div>
			{@render children()}
		</main>
		<Toast />
		<GlobalConfirm />
	</div>
{/if}
