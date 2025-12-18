<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { ArrowLeft, Store, FileText } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth.svelte';
	import sellerRequestService from '$lib/services/SellerRequests/SellerRequest.service';
	import type { SellerRequest } from '$lib/models/SellerRequests/SellerRequestType';
	let storeName = $state('');
	let storeDescription = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let myRequest = $state<SellerRequest | null>(null);
	let loadingRequest = $state(true);

	onMount(async () => {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}

		if (authState.isSeller()) {
			goto('/dashboard');
			return;
		}

		await loadMyRequest();
	});

	async function loadMyRequest() {
		loadingRequest = true;
		try {
			const response: any = await sellerRequestService.getMyRequest();
			myRequest = response?.data || response || null;
		} catch (err) {
			console.error('Error loading request:', err);
		} finally {
			loadingRequest = false;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!storeName.trim() || !storeDescription.trim()) {
			error = 'Por favor completa todos los campos';
			return;
		}

		if (storeName.length < 2 || storeName.length > 100) {
			error = 'El nombre de la tienda debe tener entre 2 y 100 caracteres';
			return;
		}

		if (storeDescription.length < 10 || storeDescription.length > 500) {
			error = 'La descripción debe tener entre 10 y 500 caracteres';
			return;
		}

		isLoading = true;
		error = null;
		success = null;

		try {
			const response: any = await sellerRequestService.createRequest({
				storeName: storeName.trim(),
				storeDescription: storeDescription.trim()
			});

			success = 'Solicitud enviada exitosamente. Un moderador la revisará pronto.';
			storeName = '';
			storeDescription = '';
			await loadMyRequest();
		} catch (err: any) {
			console.error('Error creating request:', err);
			error = err.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.';
		} finally {
			isLoading = false;
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'PENDING':
				return 'Pendiente';
			case 'APPROVED':
				return 'Aprobada';
			case 'REJECTED':
				return 'Rechazada';
			default:
				return status;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'PENDING':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'APPROVED':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'REJECTED':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-6">
		<Button variant="outline" onclick={() => goto('/dashboard')} class="mb-6">
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver al Dashboard
		</Button>

		<div class="max-w-2xl mx-auto">
			<Card class="p-6">
				<div class="flex items-center gap-3 mb-6">
					<Store class="w-8 h-8 text-cyan-600" />
					<div>
						<h1 class="text-2xl font-bold text-gray-900">Solicitar ser Vendedor</h1>
						<p class="text-gray-600">Completa el formulario para solicitar convertirte en vendedor</p>
					</div>
				</div>

				{#if loadingRequest}
					<div class="text-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
						<p class="text-gray-600 mt-2">Cargando...</p>
					</div>
				{:else if myRequest}
					<div class="mb-6 p-4 rounded-lg border {getStatusColor(myRequest.status)}">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-semibold">Solicitud Existente</p>
								<p class="text-sm mt-1">
									Estado: <span class="font-medium">{getStatusLabel(myRequest.status)}</span>
								</p>
								<p class="text-sm mt-1">Tienda: {myRequest.storeName}</p>
							</div>
							<span
								class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(myRequest.status)}"
							>
								{getStatusLabel(myRequest.status)}
							</span>
						</div>
					</div>
				{/if}

				{#if myRequest && myRequest.status === 'PENDING'}
					<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
						<p class="text-blue-800 text-sm">
							Tienes una solicitud pendiente. Un moderador la revisará pronto.
						</p>
					</div>
				{:else if myRequest && myRequest.status === 'REJECTED'}
					<div class="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
						<p class="text-red-800 text-sm mb-2">
							Tu solicitud fue rechazada. Puedes crear una nueva solicitud.
						</p>
					</div>
				{/if}

				{#if error}
					<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p class="text-red-800 text-sm">{error}</p>
					</div>
				{/if}

				{#if success}
					<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
						<p class="text-green-800 text-sm">{success}</p>
					</div>
				{/if}

				{#if !myRequest || myRequest.status !== 'PENDING'}
					<form onsubmit={handleSubmit} class="space-y-6">
						<div>
							<label for="storeName" class="block text-sm font-medium text-gray-700 mb-2">
								Nombre de la Tienda
							</label>
							<Input
								id="storeName"
								bind:value={storeName}
								placeholder="Ej: Mi Tienda Online"
								disabled={isLoading}
								required
								minlength="2"
								maxlength="100"
							/>
							<p class="text-xs text-gray-500 mt-1">Entre 2 y 100 caracteres</p>
						</div>

						<div>
							<label for="storeDescription" class="block text-sm font-medium text-gray-700 mb-2">
								Descripción de la Tienda
							</label>
							<textarea
								id="storeDescription"
								bind:value={storeDescription}
								placeholder="Describe tu tienda, qué productos vendes, etc."
								disabled={isLoading}
								required
								minlength="10"
								maxlength="500"
								rows="5"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							></textarea>
							<p class="text-xs text-gray-500 mt-1">Entre 10 y 500 caracteres</p>
						</div>

						<Button type="submit" variant="default" disabled={isLoading} class="w-full">
							{#if isLoading}
								<span>Enviando...</span>
							{:else}
								<FileText class="w-4 h-4 mr-2" />
								Enviar Solicitud
							{/if}
						</Button>
					</form>
				{/if}
			</Card>
		</div>
	</div>
</div>

