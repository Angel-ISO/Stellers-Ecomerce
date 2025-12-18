<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardHeader from '../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { ArrowLeft, Edit, Ban, UserCheck, ChevronLeft, ChevronRight, Save, X, Shield, ShieldOff } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import UserService from '$lib/services/User/User.service';
	import type { User, PaginatedUsersResponse } from '$lib/models/Users/UserType';
	import { showConfirmationAlert, showErrorAlert, toast } from '$lib/utils/alerts';
	import { authState } from '$lib/stores/auth.svelte';

	let users = $state<User[]>([]);
	let pagination = $state({
		total: 0,
		pageIndex: 1,
		pageSize: 10,
		search: '',
		totalPages: 0,
		hasPreviousPage: false,
		hasNextPage: false
	});
	let isLoading = $state(true);
	let showEditModal = $state(false);
	let editingUser = $state<User | null>(null);
	let editFormData = $state({
		displayName: '',
		bio: '',
		avatarUrl: '',
		preferences: {}
	});

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers(pageIndex = 1) {
		isLoading = true;
		try {
			const response: PaginatedUsersResponse = await UserService.getAllUsers(pageIndex, pagination.pageSize);
			// Filter out the current user from the list
			users = response.registers.filter(user => user.id !== authState.user?.id);
			pagination = {
				total: response.total - (response.registers.some(user => user.id === authState.user?.id) ? 1 : 0),
				pageIndex: response.pageIndex,
				pageSize: response.pageSize,
				search: '',
				totalPages: response.totalPages,
				hasPreviousPage: response.hasPreviousPage,
				hasNextPage: response.hasNextPage
			};
		} catch (error) {
			console.error('Error loading users:', error);
		} finally {
			isLoading = false;
		}
	}

	function handlePageChange(pageIndex: number) {
		loadUsers(pageIndex);
	}

	async function handleBanUser(userId: string, isCurrentlyBanned: boolean) {
		const result = await showConfirmationAlert(
			isCurrentlyBanned ? '¿Estás seguro de que quieres desbanear a este usuario?' : '¿Estás seguro de que quieres banear a este usuario?',
			isCurrentlyBanned ? 'Desbanear' : 'Banear'
		);

		if (!result.isConfirmed) {
			return;
		}

		try {
			if (isCurrentlyBanned) {
				await UserService.unbanUser(userId);
				toast('Usuario desbaneado exitosamente', 'success');
			} else {
				await UserService.banUser(userId);
				toast('Usuario baneado exitosamente', 'success');
			}
			await loadUsers(pagination.pageIndex, pagination.search);
		} catch (error: any) {
			console.error('Error updating user ban status:', error);
			await showErrorAlert(error.message || 'Error al actualizar el estado del usuario');
		}
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function openEditModal(user: User) {
		editingUser = user;
		editFormData = {
			displayName: user.displayName || '',
			bio: user.bio || '',
			avatarUrl: user.avatarUrl || '',
			preferences: user.preferences || {}
		};
		showEditModal = true;
	}

	function closeEditModal() {
		showEditModal = false;
		editingUser = null;
		editFormData = {
			displayName: '',
			bio: '',
			avatarUrl: '',
			preferences: {}
		};
	}

	async function handleEditUser() {
		if (!editingUser) return;

		try {
			await UserService.updateUser(editingUser.id, editFormData);
			toast('Usuario actualizado exitosamente', 'success');
			closeEditModal();
			await loadUsers(pagination.pageIndex);
		} catch (error: any) {
			console.error('Error updating user:', error);
			await showErrorAlert(error.message || 'Error al actualizar el usuario');
		}
	}

	async function handleModeratorStatus(userId: string, isCurrentlyModerator: boolean) {
		const action = isCurrentlyModerator ? 'remover' : 'otorgar';
		const result = await showConfirmationAlert(
			`¿Estás seguro de que quieres ${action} permisos de moderador a este usuario?`,
			isCurrentlyModerator ? 'Remover Mod' : 'Otorgar Mod'
		);

		if (!result.isConfirmed) {
			return;
		}

		try {
			if (isCurrentlyModerator) {
				await UserService.removeModeratorStatus(userId);
				toast('Permisos de moderador removidos exitosamente', 'success');
			} else {
				await UserService.giveModeratorStatus(userId);
				toast('Permisos de moderador otorgados exitosamente', 'success');
			}
			await loadUsers(pagination.pageIndex);
		} catch (error: any) {
			console.error('Error updating moderator status:', error);
			await showErrorAlert(error.message || 'Error al actualizar el estado del moderador');
		}
	}
</script>

<DashboardHeader title="Gestión de Usuarios" subtitle="Administrar usuarios del sistema">
	{#snippet actions()}
		<Button variant="outline" onclick={() => goto('/dashboard/admin')}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	<!-- Users Table -->
	<Card>
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="p-8 text-center text-gray-500">Cargando usuarios...</div>
			{:else if users.length === 0}
				<div class="p-8 text-center text-gray-500">No hay usuarios para mostrar.</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avatar</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bio</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moderador</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each users as user}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.avatarUrl}
										<img src={user.avatarUrl} alt={user.displayName} class="w-10 h-10 rounded-full" />
									{:else}
										<div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
											<span class="text-sm font-medium text-gray-600">
												{user.displayName?.charAt(0)?.toUpperCase() || '?'}
											</span>
										</div>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
									{user.displayName || 'Sin nombre'}
								</td>
								<td class="px-6 py-4 text-gray-600 max-w-xs truncate">
									{user.bio || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.isModerator}
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											Sí
										</span>
									{:else}
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
											No
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.isBanned}
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
											Baneado
										</span>
									{:else}
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
											Activo
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-gray-600">
									{formatDate(user.createdAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<button
											onclick={() => handleModeratorStatus(user.id, user.isModerator)}
											class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
											title={user.isModerator ? 'Remover moderador' : 'Otorgar moderador'}
										>
											{#if user.isModerator}
												<ShieldOff class="w-4 h-4 text-orange-600" />
											{:else}
												<Shield class="w-4 h-4 text-blue-600" />
											{/if}
										</button>
										<button
											onclick={() => openEditModal(user)}
											class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
											title="Editar usuario"
										>
											<Edit class="w-4 h-4" />
										</button>
										<button
											onclick={() => handleBanUser(user.id, user.isBanned)}
											class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
											title={user.isBanned ? 'Desbanear' : 'Banear'}
										>
											{#if user.isBanned}
												<UserCheck class="w-4 h-4 text-green-600" />
											{:else}
												<Ban class="w-4 h-4 text-red-600" />
											{/if}
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
				<div class="text-sm text-gray-700">
					Mostrando {((pagination.pageIndex - 1) * pagination.pageSize) + 1} a {Math.min(pagination.pageIndex * pagination.pageSize, pagination.total)} de {pagination.total} resultados
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={!pagination.hasPreviousPage}
						onclick={() => handlePageChange(pagination.pageIndex - 1)}
					>
						<ChevronLeft class="w-4 h-4" />
						Anterior
					</Button>
					<span class="text-sm text-gray-700">
						Página {pagination.pageIndex} de {pagination.totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={!pagination.hasNextPage}
						onclick={() => handlePageChange(pagination.pageIndex + 1)}
					>
						Siguiente
						<ChevronRight class="w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}
	</Card>

	<!-- Edit User Modal -->
	{#if showEditModal && editingUser}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Editar Usuario</h3>
				<div class="space-y-4">
					<div>
						<label for="edit-displayName" class="block text-sm font-medium text-gray-700 mb-2">
							Nombre de Usuario
						</label>
						<Input
							id="edit-displayName"
							bind:value={editFormData.displayName}
							placeholder="Nombre de usuario"
						/>
					</div>
					<div>
						<label for="edit-bio" class="block text-sm font-medium text-gray-700 mb-2">
							Biografía
						</label>
						<textarea
							id="edit-bio"
							bind:value={editFormData.bio}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
							rows="3"
							placeholder="Biografía del usuario"
						></textarea>
					</div>
					<div>
						<label for="edit-avatarUrl" class="block text-sm font-medium text-gray-700 mb-2">
							URL del Avatar
						</label>
						<Input
							id="edit-avatarUrl"
							bind:value={editFormData.avatarUrl}
							placeholder="https://example.com/avatar.jpg"
						/>
					</div>
				</div>
				<div class="flex gap-2 mt-6">
					<Button variant="default" onclick={handleEditUser}>
						<Save class="w-4 h-4 mr-2" />
						Guardar Cambios
					</Button>
					<Button variant="outline" onclick={closeEditModal}>
						<X class="w-4 h-4 mr-2" />
						Cancelar
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>