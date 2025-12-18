<script lang="ts">
	import type { UpdateUserData } from '$lib/models/Users/UserType';
	import { UsersViewModel } from '$lib/viewmodels/Users/users.viewmodel.svelte';
	import { onMount } from 'svelte';

	// Instancia del ViewModel
	const viewModel = new UsersViewModel();

	// Variables locales para el formulario de edición
	let editingUserId = $state<string | null>(null);
	let editForm = $state<UpdateUserData>({});
	let avatarFile = $state<File | null>(null);

	// Cargar usuario actual al montar el componente
	onMount(async () => {
		// Ejemplo: cargar un usuario específico
		// await viewModel.loadUserById('user-id-aqui');
		
		// O cargar todos los usuarios (requiere ser moderador)
		// await viewModel.loadUsers();
	});

	/**
	 * Inicia la edición de un usuario
	 */
	function startEdit(userId: string) {
		editingUserId = userId;
		const user = viewModel.users.find(u => u.id === userId);
		if (user) {
			editForm = {
				displayName: user.displayName,
				bio: user.bio,
				preferences: user.preferences
			};
		}
	}

	/**
	 * Cancela la edición
	 */
	function cancelEdit() {
		editingUserId = null;
		editForm = {};
	}

	/**
	 * Guarda los cambios del usuario
	 */
	async function saveUser() {
		if (!editingUserId) return;

		const success = await viewModel.updateUser(editingUserId, editForm);
		if (success) {
			editingUserId = null;
			editForm = {};
		}
	}

	/**
	 * Maneja el cambio de avatar
	 */
	async function handleAvatarChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			avatarFile = input.files[0];
			
			// Subir el avatar inmediatamente
			const avatarUrl = await viewModel.uploadAvatar(avatarFile);
			if (avatarUrl && editingUserId) {
				// Actualizar el usuario con la nueva URL del avatar
				await viewModel.updateUser(editingUserId, { avatarUrl });
			}
		}
	}

	/**
	 * Elimina un usuario
	 */
	async function deleteUser(userId: string) {
		if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
			await viewModel.deleteUser(userId);
		}
	}

	/**
	 * Busca usuarios
	 */
	async function handleSearch(event: Event) {
		const input = event.target as HTMLInputElement;
		await viewModel.searchUsers(input.value);
	}
</script>

<div class="users-container">
	<h1>Gestión de Usuarios</h1>

	<!-- Barra de búsqueda -->
	<div class="search-bar">
		<input
			type="text"
			placeholder="Buscar usuarios..."
			oninput={handleSearch}
			value={viewModel.search}
		/>
	</div>

	<!-- Estado de carga y errores -->
	{#if viewModel.loading}
		<p class="loading">Cargando...</p>
	{/if}

	{#if viewModel.error}
		<div class="error">
			<p>{viewModel.error}</p>
			<button onclick={() => viewModel.clearError()}>Cerrar</button>
		</div>
	{/if}

	<!-- Usuario actual (vista de perfil) -->
	{#if viewModel.currentUser && !editingUserId}
		<div class="user-profile">
			{#if viewModel.currentUser.avatarUrl}
				<img src={viewModel.currentUser.avatarUrl} alt="Avatar" class="avatar" />
			{/if}
			<h2>{viewModel.currentUser.displayName || 'Sin nombre'}</h2>
			<p>{viewModel.currentUser.bio || 'Sin biografía'}</p>
			<p>Email: {viewModel.currentUser.email || 'No disponible'}</p>
			<p>Moderador: {viewModel.currentUser.isModerator ? 'Sí' : 'No'}</p>
			<p>Baneado: {viewModel.currentUser.isBanned ? 'Sí' : 'No'}</p>
			
			<button onclick={() => startEdit(viewModel.currentUser!.id)}>Editar Perfil</button>
		</div>
	{/if}

	<!-- Formulario de edición -->
	{#if editingUserId}
		<div class="edit-form">
			<h3>Editar Usuario</h3>
			
			<div class="form-group">
				<label for="displayName">Nombre para mostrar:</label>
				<input
					id="displayName"
					type="text"
					bind:value={editForm.displayName}
				/>
			</div>

			<div class="form-group">
				<label for="bio">Biografía:</label>
				<textarea
					id="bio"
					bind:value={editForm.bio}
					rows="4"
				></textarea>
			</div>

			<div class="form-group">
				<label for="avatar">Avatar:</label>
				<input
					id="avatar"
					type="file"
					accept="image/png, image/jpeg, image/webp"
					onchange={handleAvatarChange}
				/>
				<small>Formatos permitidos: PNG, JPEG, WebP - Máximo 2MB</small>
			</div>

			<div class="form-actions">
				<button onclick={saveUser} disabled={viewModel.loading}>Guardar</button>
				<button onclick={cancelEdit} disabled={viewModel.loading}>Cancelar</button>
			</div>
		</div>
	{/if}

	<!-- Lista de usuarios (solo para moderadores) -->
	{#if viewModel.users.length > 0}
		<div class="users-list">
			<h3>Usuarios ({viewModel.pagination.total})</h3>
			
			<table>
				<thead>
					<tr>
						<th>Avatar</th>
						<th>Nombre</th>
						<th>Email</th>
						<th>Moderador</th>
						<th>Baneado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each viewModel.users as user (user.id)}
						<tr>
							<td>
								{#if user.avatarUrl}
									<img src={user.avatarUrl} alt="Avatar" class="avatar-small" />
								{:else}
									<div class="avatar-placeholder"></div>
								{/if}
							</td>
							<td>{user.displayName || 'Sin nombre'}</td>
							<td>{user.email || 'No disponible'}</td>
							<td>{user.isModerator ? '✓' : '✗'}</td>
							<td>{user.isBanned ? '✓' : '✗'}</td>
							<td>
								<button onclick={() => startEdit(user.id)}>Editar</button>
								<button onclick={() => deleteUser(user.id)} class="delete">Eliminar</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- Paginación -->
			<div class="pagination">
				<button 
					onclick={() => viewModel.previousPage()} 
					disabled={!viewModel.pagination.hasPreviousPage || viewModel.loading}
				>
					Anterior
				</button>
				
				<span>
					Página {viewModel.pagination.pageIndex + 1} de {viewModel.pagination.totalPages}
				</span>
				
				<button 
					onclick={() => viewModel.nextPage()} 
					disabled={!viewModel.pagination.hasNextPage || viewModel.loading}
				>
					Siguiente
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.users-container {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.search-bar {
		margin-bottom: 2rem;
	}

	.search-bar input {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.loading {
		text-align: center;
		color: #666;
	}

	.error {
		background-color: #fee;
		border: 1px solid #fcc;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.error p {
		margin: 0;
		color: #c00;
	}

	.user-profile {
		background: #f9f9f9;
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		margin-bottom: 1rem;
	}

	.edit-form {
		background: #f9f9f9;
		padding: 2rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.form-group small {
		display: block;
		margin-top: 0.25rem;
		color: #666;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f5f5f5;
		font-weight: bold;
	}

	.avatar-small {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: #ddd;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: none;
		border-radius: 4px;
		background-color: #007bff;
		color: white;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	button.delete {
		background-color: #dc3545;
	}

	button.delete:hover:not(:disabled) {
		background-color: #c82333;
	}
</style>
