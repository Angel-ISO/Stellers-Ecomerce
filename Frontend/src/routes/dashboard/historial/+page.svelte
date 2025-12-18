<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardHeader from '../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { OrdersViewModel } from '$lib/viewmodels/Orders/orders.viewmodel.svelte';
	import { formatCurrency, formatDate } from '$lib/lib/utils';
	import {
		Search,
		Filter,
		Download,
		Package,
		CheckCircle,
		Truck,
		XCircle,
		ChevronDown
	} from 'lucide-svelte';
	import type { OrderStatus } from '$lib/models/Orders/OrderType';
	import { authState } from '$lib/stores/auth.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { confirmStore } from '$lib/stores/confirm.svelte';

	const viewModel = new OrdersViewModel();

	const statusOptions: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

	let isUpdatingStatus = $state<Record<string, boolean>>({});
	let showStatusDropdown = $state<Record<string, boolean>>({});

	onMount(async () => {
		await viewModel.loadOrders();

		// Cerrar dropdowns al hacer clic fuera
		if (typeof window !== 'undefined') {
			window.addEventListener('click', () => {
				showStatusDropdown = {};
			});
		}
	});

	function toggleStatusDropdown(orderId: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		showStatusDropdown[orderId] = !showStatusDropdown[orderId];
		// Cerrar otros dropdowns
		Object.keys(showStatusDropdown).forEach((id) => {
			if (id !== orderId) {
				showStatusDropdown[id] = false;
			}
		});
	}

	function closeStatusDropdown(orderId: string) {
		showStatusDropdown[orderId] = false;
	}

	function handleViewOrder(orderId: string) {
		console.log('View order:', orderId);
	}

	function handleExportOrders() {
		console.log('Export orders');
	}

	async function handleMarkAsPaid(orderId: string) {
		const confirmed = await confirmStore.confirm({
			title: 'Marcar como pagada',
			message: '¿Confirmar que esta orden ha sido pagada?',
			confirmText: 'Sí, marcar como pagada',
			variant: 'default'
		});
		if (!confirmed) return;

		isUpdatingStatus[orderId] = true;
		try {
			await viewModel.markAsPaid(orderId);
			toastStore.success('Orden marcada como pagada exitosamente');
		} catch (err) {
			toastStore.error(viewModel.error || 'Error al actualizar el estado');
		} finally {
			isUpdatingStatus[orderId] = false;
		}
	}

	async function handleMarkAsShipped(orderId: string) {
		const confirmed = await confirmStore.confirm({
			title: 'Marcar como enviada',
			message: '¿Confirmar que esta orden ha sido enviada?',
			confirmText: 'Sí, marcar como enviada',
			variant: 'default'
		});
		if (!confirmed) return;

		isUpdatingStatus[orderId] = true;
		try {
			await viewModel.markAsShipped(orderId);
			toastStore.success('Orden marcada como enviada exitosamente');
		} catch (err) {
			toastStore.error(viewModel.error || 'Error al actualizar el estado');
		} finally {
			isUpdatingStatus[orderId] = false;
		}
	}

	async function handleMarkAsDelivered(orderId: string) {
		const confirmed = await confirmStore.confirm({
			title: 'Marcar como entregada',
			message: '¿Confirmar que has recibido esta orden?',
			confirmText: 'Sí, la recibí',
			variant: 'default'
		});
		if (!confirmed) return;

		isUpdatingStatus[orderId] = true;
		try {
			// Solo el comprador puede marcar como entregado
			await viewModel.markAsDelivered(orderId);
			toastStore.success('Orden marcada como entregada exitosamente');
		} catch (err) {
			toastStore.error(viewModel.error || 'Error al actualizar el estado');
		} finally {
			isUpdatingStatus[orderId] = false;
		}
	}

	async function handleCancelOrder(orderId: string) {
		const confirmed = await confirmStore.confirm({
			title: 'Cancelar orden',
			message: '¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.',
			confirmText: 'Sí, cancelar orden',
			cancelText: 'No, mantener orden',
			variant: 'danger'
		});
		if (!confirmed) return;

		isUpdatingStatus[orderId] = true;
		try {
			await viewModel.cancelOrder(orderId);
			toastStore.success('Orden cancelada exitosamente');
		} catch (err) {
			toastStore.error(viewModel.error || 'Error al cancelar la orden');
		} finally {
			isUpdatingStatus[orderId] = false;
		}
	}

	function getOrderRoleLabel(order: any): string {
		if (viewModel.isSeller(order)) return 'Vendedor';
		if (viewModel.isBuyer(order)) return 'Comprador';
		return 'Usuario';
	}
</script>

<DashboardHeader
	title={authState.isSeller() ? 'Órdenes Recibidas' : 'Historial de Compras'}
	subtitle={authState.isSeller() ? 'Gestiona las órdenes que has recibido' : 'Ver y gestionar todas tus órdenes'}
>
	{#snippet actions()}
		<Button variant="outline" onclick={handleExportOrders}>
			<Download class="w-4 h-4 mr-2" />
			Export
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	{#if viewModel.isLoading}
		<Card class="p-8">
			<div class="flex items-center justify-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
				<span class="ml-4 text-gray-600">Cargando órdenes...</span>
			</div>
		</Card>
	{:else if viewModel.error}
		<Card class="p-8">
			<div class="text-center">
				<p class="text-red-500 text-lg mb-4">{viewModel.error}</p>
				<Button onclick={() => viewModel.loadOrders()}>Reintentar</Button>
			</div>
		</Card>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<Card class="p-6">
				<h3 class="text-sm text-gray-600 mb-2">Total Orders</h3>
				<p class="text-3xl font-bold text-gray-900">{viewModel.orders.length}</p>
			</Card>
			<Card class="p-6">
				<h3 class="text-sm text-gray-600 mb-2">Total Revenue</h3>
				<p class="text-3xl font-bold text-gray-900">{formatCurrency(viewModel.totalRevenue())}</p>
			</Card>
			<Card class="p-6">
				<h3 class="text-sm text-gray-600 mb-2">Pending</h3>
				<p class="text-3xl font-bold text-yellow-600">{viewModel.pendingOrders()}</p>
			</Card>
			<Card class="p-6">
				<h3 class="text-sm text-gray-600 mb-2">Delivered</h3>
				<p class="text-3xl font-bold text-green-600">{viewModel.deliveredOrders()}</p>
			</Card>
		</div>

		<!-- Search and Filters -->
		<Card class="p-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1 relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<Input
						bind:value={viewModel.searchQuery}
						placeholder="Buscar por ID de orden o nombre de producto..."
						class="pl-10"
					/>
				</div>
				<Button variant="outline">
					<Filter class="w-4 h-4 mr-2" />
					More Filters
				</Button>
			</div>

			<!-- Status Filter -->
			<div class="mt-4 flex flex-wrap gap-2">
				<button
					onclick={() => (viewModel.selectedStatus = null)}
					class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {viewModel.selectedStatus ===
					null
						? 'bg-cyan-500 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					All Status
				</button>
				{#each statusOptions as status}
					<button
						onclick={() => (viewModel.selectedStatus = status)}
						class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {viewModel.selectedStatus ===
						status
							? 'bg-cyan-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						{viewModel.getOrderStatusLabel(status)}
					</button>
				{/each}
			</div>
		</Card>

		<Card>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Orden
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Rol
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Items
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Total
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Estado
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Fecha
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if viewModel.filteredOrders().length === 0}
							<tr>
								<td colspan="7" class="px-6 py-8 text-center text-gray-500">
									No se encontraron órdenes. Intenta ajustar tu búsqueda o filtros.
								</td>
							</tr>
						{:else}
							{#each viewModel.filteredOrders() as order}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-3">
											<div
												class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"
											>
												<Package class="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<p class="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
												<p class="text-xs text-gray-500">ID: {order.id}</p>
											</div>
										</div>
									</td>
									<td class="px-6 py-4">
										<div>
											<Badge variant={viewModel.isSeller(order) ? 'default' : 'secondary'}>
												{getOrderRoleLabel(order)}
											</Badge>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<p class="text-gray-900">
												{order.items.length} item{order.items.length !== 1 ? 's' : ''}
											</p>
											<p class="text-xs text-gray-500 max-w-xs truncate">
												{order.items
													.map(
														(item) => item.productName || `Producto ${item.productId.slice(0, 8)}`
													)
													.join(', ')}
											</p>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<p class="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<Badge variant={viewModel.getOrderStatusColor(order.status)}>
											{viewModel.getOrderStatusLabel(order.status)}
										</Badge>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<p class="text-gray-900">{formatDate(new Date(order.createdAt))}</p>
											{#if new Date(order.updatedAt).getTime() !== new Date(order.createdAt).getTime()}
												<p class="text-xs text-gray-500">
													Actualizado: {formatDate(new Date(order.updatedAt))}
												</p>
											{/if}
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center gap-2 relative">
											{#if viewModel.isSeller(order)}
												<!-- Seller Actions - Dropdown para cambiar estado -->
												<div class="relative">
													<button
														onclick={(e) => toggleStatusDropdown(order.id, e)}
														disabled={isUpdatingStatus[order.id] ||
															order.status === 'DELIVERED' ||
															order.status === 'CANCELLED'}
														class="px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
														title="Cambiar Estado"
													>
														{isUpdatingStatus[order.id] ? 'Actualizando...' : 'Cambiar Estado'}
														<ChevronDown class="w-4 h-4" />
													</button>
													{#if showStatusDropdown[order.id]}
														<div
															class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
															role="menu"
															tabindex="-1"
															onclick={(e) => e.stopPropagation()}
															onkeydown={(e) => {
																if (e.key === 'Escape') {
																	closeStatusDropdown(order.id);
																}
															}}
														>
															<div class="py-1">
																{#if order.status === 'PENDING'}
																	<button
																		onclick={() => {
																			handleMarkAsPaid(order.id);
																			closeStatusDropdown(order.id);
																		}}
																		disabled={isUpdatingStatus[order.id]}
																		class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 disabled:opacity-50"
																	>
																		<CheckCircle class="w-4 h-4" />
																		Marcar como Pagado
																	</button>
																{:else if order.status === 'PAID'}
																	<button
																		onclick={() => {
																			handleMarkAsShipped(order.id);
																			closeStatusDropdown(order.id);
																		}}
																		disabled={isUpdatingStatus[order.id]}
																		class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 disabled:opacity-50"
																	>
																		<Truck class="w-4 h-4" />
																		Marcar como Enviado
																	</button>
																{/if}
																{#if order.status === 'SHIPPED'}
																	<p class="px-4 py-2 text-xs text-gray-500 italic">
																		Solo el comprador puede marcar como entregado
																	</p>
																{/if}
																{#if order.status !== 'DELIVERED' && order.status !== 'CANCELLED'}
																	<div class="border-t border-gray-200 my-1"></div>
																	<button
																		onclick={() => {
																			handleCancelOrder(order.id);
																			closeStatusDropdown(order.id);
																		}}
																		disabled={isUpdatingStatus[order.id]}
																		class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
																	>
																		<XCircle class="w-4 h-4" />
																		Cancelar Orden
																	</button>
																{/if}
															</div>
														</div>
													{/if}
												</div>
											{:else if viewModel.isBuyer(order)}
												<!-- Buyer Actions -->
												{#if order.status === 'SHIPPED'}
													<button
														onclick={() => handleMarkAsDelivered(order.id)}
														disabled={isUpdatingStatus[order.id]}
														class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
														title="Marcar como Entregado"
													>
														<CheckCircle class="w-4 h-4" />
														Entregado
													</button>
													<button
														onclick={() => handleCancelOrder(order.id)}
														disabled={isUpdatingStatus[order.id]}
														class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
														title="Cancelar Orden"
													>
														<XCircle class="w-4 h-4" />
														Cancelar
													</button>
												{/if}
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</Card>

		<!-- Order Details Expandable (Optional) -->
		{#if viewModel.filteredOrders().length > 0}
			<Card class="p-6">
				<h3 class="text-lg font-bold text-gray-900 mb-4">Estadísticas de Órdenes</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
						<p class="text-sm text-yellow-900">Pagadas</p>
						<p class="text-2xl font-bold text-yellow-900">{viewModel.processingOrders()}</p>
					</div>
					<div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
						<p class="text-sm text-blue-900">Enviadas</p>
						<p class="text-2xl font-bold text-blue-900">
							{viewModel.orders.filter((o) => o.status === 'SHIPPED').length}
						</p>
					</div>
					<div class="p-4 bg-green-50 rounded-lg border border-green-200">
						<p class="text-sm text-green-900">Entregadas</p>
						<p class="text-2xl font-bold text-green-900">{viewModel.deliveredOrders()}</p>
					</div>
				</div>
			</Card>
		{/if}
	{/if}
</div>
