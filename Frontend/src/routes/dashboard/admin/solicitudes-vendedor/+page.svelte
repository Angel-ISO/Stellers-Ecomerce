<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DashboardHeader from '../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { CheckCircle, XCircle, Package, RefreshCw } from 'lucide-svelte';
	import sellerRequestService from '$lib/services/SellerRequests/SellerRequest.service';
	import type { SellerRequest } from '$lib/models/SellerRequests/SellerRequestType';
	import { formatDate } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';

	let requests = $state<SellerRequest[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let processingId = $state<string | null>(null);

	onMount(() => {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}

		if (!authState.isModerator()) {
			goto('/unauthorized');
			return;
		}

		loadRequests();
	});

	async function loadRequests() {
		isLoading = true;
		error = null;
		try {
			const response: any = await sellerRequestService.getPendingRequests();
			requests = response?.data || response || [];
		} catch (err: any) {
			console.error('Error loading requests:', err);
			error = err.message || 'Error al cargar las solicitudes';
		} finally {
			isLoading = false;
		}
	}

	async function handleApprove(id: string) {
		if (!confirm('¿Estás seguro de que quieres aprobar esta solicitud?')) {
			return;
		}

		processingId = id;
		try {
			await sellerRequestService.approveRequest(id);
			await loadRequests();
		} catch (err: any) {
			alert(err.message || 'Error al aprobar la solicitud');
		} finally {
			processingId = null;
		}
	}

	async function handleReject(id: string) {
		if (!confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) {
			return;
		}

		processingId = id;
		try {
			await sellerRequestService.rejectRequest(id);
			await loadRequests();
		} catch (err: any) {
			alert(err.message || 'Error al rechazar la solicitud');
		} finally {
			processingId = null;
		}
	}

	function getStatusColor(): 'warning' {
		return 'warning';
	}
</script>

<DashboardHeader
	title="Solicitudes de Vendedor"
	subtitle="Gestiona las solicitudes para convertirse en vendedor"
>
	{#snippet actions()}
		<Button variant="outline" onclick={loadRequests} disabled={isLoading}>
			<RefreshCw class="w-4 h-4 mr-2" />
			Actualizar
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	{#if isLoading}
		<Card class="p-8">
			<div class="flex items-center justify-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
				<span class="ml-4 text-gray-600">Cargando solicitudes...</span>
			</div>
		</Card>
	{:else if error}
		<Card class="p-8">
			<div class="text-center">
				<p class="text-red-500 mb-4">{error}</p>
				<Button onclick={loadRequests}>Reintentar</Button>
			</div>
		</Card>
	{:else if requests.length === 0}
		<Card class="p-8">
			<div class="text-center">
				<Package class="w-16 h-16 mx-auto text-gray-400 mb-4" />
				<h2 class="text-xl font-semibold text-gray-900 mb-2">No hay solicitudes pendientes</h2>
				<p class="text-gray-600">Todas las solicitudes han sido procesadas</p>
			</div>
		</Card>
	{:else}
		<Card>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Usuario
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nombre Tienda
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Descripción
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Fecha
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each requests as request}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center"
										>
											<Package class="w-5 h-5 text-cyan-600" />
										</div>
										<div>
											<p class="font-medium text-gray-900">ID: {request.userId.slice(0, 8)}</p>
											<p class="text-xs text-gray-500">{request.userId}</p>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<p class="font-semibold text-gray-900">{request.storeName}</p>
								</td>
								<td class="px-6 py-4">
									<p class="text-sm text-gray-600 line-clamp-2 max-w-md">{request.storeDescription}</p>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<p class="text-sm text-gray-900">{formatDate(request.createdAt)}</p>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<Button
											variant="default"
											onclick={() => handleApprove(request.id)}
											disabled={processingId === request.id}
											class="bg-green-600 hover:bg-green-700"
										>
											<CheckCircle class="w-4 h-4 mr-1" />
											Aprobar
										</Button>
										<Button
											variant="destructive"
											onclick={() => handleReject(request.id)}
											disabled={processingId === request.id}
										>
											<XCircle class="w-4 h-4 mr-1" />
											Rechazar
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	{/if}
</div>

