<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/Auth/Auth.service';
	import { authState } from '$lib/stores/auth.svelte';
	import { Loader2, AlertCircle } from 'lucide-svelte';
	import { ShoppingCart } from 'lucide-svelte';

	let isLoading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const payload = await AuthService.handleOAuthCallback();
			if (payload) {
				authState.setUser(payload.user);
				goto('/dashboard/productos');
			} else {
				throw new Error('Failed to complete authentication');
			}
		} catch (err: any) {
			console.error('Callback error:', err);
			error = err.message || 'An error occurred during authentication';
			isLoading = false;
			setTimeout(() => {
				goto('/auth');
			}, 3000);
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md text-center">
		<div class="mb-8">
			<a href="/" class="inline-flex items-center gap-2 mb-2">
				<ShoppingCart class="w-10 h-10 text-blue-600" />
				<span class="text-3xl font-bold text-blue-600">Stellers</span>
			</a>
		</div>

		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if isLoading}
				<div class="py-12">
					<Loader2 class="w-16 h-16 animate-spin text-cyan-500 mx-auto mb-4" />
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Completing sign in...</h2>
					<p class="text-gray-600">Please wait while we verify your account</p>
				</div>
			{:else if error}
				<div class="py-12">
					<AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Authentication failed</h2>
					<p class="text-red-600 mb-4">{error}</p>
					<p class="text-sm text-gray-600">Redirecting to login page...</p>
				</div>
			{/if}
		</div>
	</div>
</div>

