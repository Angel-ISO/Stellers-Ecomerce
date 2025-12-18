<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import AuthService from '$lib/services/Auth/Auth.service';
	import { UsersViewModel } from '$lib/viewmodels/Users/users.viewmodel.svelte';
	import {
		AlertCircle,
		Camera,
		CheckCircle2,
		Loader2,
		Mail,
		Save,
		Shield,
		Upload,
		User
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	const viewModel = new UsersViewModel();
	
	let displayName = $state('');
	let bio = $state('');
	let email = $state('');
	let avatarFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isEditing = $state(false);
	let showSuccessMessage = $state(false);
	let isInitializing = $state(true);

	onMount(async () => {
		try {
			// Verificar autenticación
			if (!AuthService.isAuthenticated()) {
				console.error('No hay sesión activa');
				goto('/auth');
				return;
			}

			const user = AuthService.getUser();
			if (!user?.id) {
				console.error('No se encontró información del usuario');
				goto('/auth');
				return;
			}

			// Cargar datos del usuario
			await viewModel.loadUserById(user.id);
			
			if (viewModel.currentUser) {
				displayName = viewModel.currentUser.displayName || '';
				bio = viewModel.currentUser.bio || '';
				email = viewModel.currentUser.email || user.email || '';
				previewUrl = viewModel.currentUser.avatarUrl || null;
			}
		} catch (error: any) {
			console.error('Error al cargar perfil:', error);
			
			// Si es error de autenticación, redirigir al login
			if (error.message?.includes('authentication_error')) {
				console.log('Token inválido o expirado, redirigiendo a login...');
				AuthService.logout();
				goto('/auth');
			} else {
				viewModel.error = 'Error al cargar tu perfil. Por favor, intenta de nuevo.';
			}
		} finally {
			isInitializing = false;
		}
	});

	async function handleAvatarChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			
			// Validar tamaño (2MB)
			if (file.size > 2 * 1024 * 1024) {
				viewModel.error = 'El archivo debe ser menor a 2MB';
				return;
			}

			// Validar tipo
			if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
				viewModel.error = 'Solo se permiten imágenes PNG, JPEG o WebP';
				return;
			}

			avatarFile = file;
			previewUrl = URL.createObjectURL(file);
			isEditing = true;
		}
	}

	async function handleSubmit() {
		const user = AuthService.getUser();
		if (!user?.id) {
			viewModel.error = 'No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.';
			return;
		}

		viewModel.error = null;
		
		try {
			let newAvatarUrl = viewModel.currentUser?.avatarUrl;

			// Subir avatar si se seleccionó uno nuevo
			if (avatarFile) {
				const url = await viewModel.uploadAvatar(avatarFile);
				if (url) {
					newAvatarUrl = url;
				}
			}

			// Actualizar perfil
			const success = await viewModel.updateUser(user.id, {
				displayName,
				bio,
				avatarUrl: newAvatarUrl
			});

			if (success) {
				showSuccessMessage = true;
				isEditing = false;
				avatarFile = null;
				
				// Actualizar usuario en localStorage
				const updatedUser = { ...user, displayName, avatarUrl: newAvatarUrl };
				AuthService.setUser(updatedUser);
				
				// Ocultar mensaje después de 3 segundos
				setTimeout(() => {
					showSuccessMessage = false;
				}, 3000);
			}
		} catch (error: any) {
			console.error('Error al actualizar perfil:', error);
			
			// Si es error de autenticación, redirigir al login
			if (error.message?.includes('authentication_error')) {
				console.log('Token inválido o expirado, redirigiendo a login...');
				AuthService.logout();
				goto('/auth');
			}
		}
	}

	function handleCancel() {
		if (viewModel.currentUser) {
			displayName = viewModel.currentUser.displayName || '';
			bio = viewModel.currentUser.bio || '';
			previewUrl = viewModel.currentUser.avatarUrl || null;
			avatarFile = null;
			isEditing = false;
			viewModel.error = null;
		}
	}

	function triggerFileInput() {
		document.getElementById('avatar-input')?.click();
	}
</script>

<!-- Loading State -->
{#if isInitializing}
	<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
		<div class="text-center">
			<Loader2 class="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
			<p class="text-gray-600 font-medium">Cargando tu perfil...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
		<div class="max-w-5xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
				<p class="text-gray-600">Administra tu información personal y preferencias</p>
			</div>

			<!-- Success Message -->
			{#if showSuccessMessage}
				<div class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
					<div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
						<CheckCircle2 class="w-6 h-6 text-white" />
					</div>
					<div class="flex-1">
						<h3 class="font-semibold text-green-900">¡Perfil actualizado!</h3>
						<p class="text-sm text-green-700">Tus cambios se han guardado correctamente.</p>
					</div>
				</div>
			{/if}

			<!-- Error Message -->
			{#if viewModel.error}
				<div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
					<div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
						<AlertCircle class="w-6 h-6 text-white" />
					</div>
					<div class="flex-1">
						<h3 class="font-semibold text-red-900">Error</h3>
						<p class="text-sm text-red-700">{viewModel.error}</p>
					</div>
					<button 
						onclick={() => viewModel.clearError()} 
						class="text-red-400 hover:text-red-600 transition-colors"
						title="Cerrar mensaje"
						aria-label="Cerrar mensaje de error"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Profile Picture Card -->
				<div class="lg:col-span-1">
					<Card class="p-6 bg-white shadow-lg border-0">
						<div class="text-center">
							<div class="relative inline-block mb-4">
								{#if previewUrl}
									<img 
										src={previewUrl} 
										alt="Avatar" 
										class="w-32 h-32 rounded-full object-cover ring-4 ring-cyan-100 shadow-xl"
									/>
								{:else}
									<div class="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ring-4 ring-cyan-100 shadow-xl">
										<User class="w-16 h-16 text-white" />
									</div>
								{/if}
								
								<button
									onclick={triggerFileInput}
									class="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
									title="Cambiar foto"
									aria-label="Cambiar foto de perfil"
								>
									<Camera class="w-4 h-4" />
								</button>
								
								<input
									id="avatar-input"
									type="file"
									accept="image/png, image/jpeg, image/webp"
									onchange={handleAvatarChange}
									class="hidden"
								/>
							</div>

							<h2 class="text-xl font-bold text-gray-900 mb-1">
								{displayName || 'Usuario'}
							</h2>
							<p class="text-sm text-gray-500 mb-4">{email}</p>

							{#if viewModel.currentUser?.isModerator}
								<div class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
									<Shield class="w-4 h-4" />
									<span>Moderador</span>
								</div>
							{/if}

							<Separator class="my-6" />

							<div class="text-left space-y-3">
								<div class="flex items-center gap-3 text-sm">
									<div class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
										<Upload class="w-4 h-4 text-cyan-600" />
									</div>
									<div>
										<p class="font-medium text-gray-700">Formatos</p>
										<p class="text-xs text-gray-500">PNG, JPEG, WebP</p>
									</div>
								</div>
								<div class="flex items-center gap-3 text-sm">
									<div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
										<AlertCircle class="w-4 h-4 text-blue-600" />
									</div>
									<div>
										<p class="font-medium text-gray-700">Tamaño máximo</p>
										<p class="text-xs text-gray-500">2 MB</p>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</div>

				<!-- Profile Information Card -->
				<div class="lg:col-span-2">
					<Card class="p-8 bg-white shadow-lg border-0">
						<h3 class="text-2xl font-bold text-gray-900 mb-6">Información Personal</h3>

						<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
							<!-- Display Name -->
							<div class="space-y-2">
								<label for="displayName" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
									<User class="w-4 h-4 text-cyan-500" />
									Nombre para mostrar
								</label>
								<Input
									id="displayName"
									type="text"
									bind:value={displayName}
									placeholder="Ingresa tu nombre"
									oninput={() => (isEditing = true)}
									class="h-12 bg-gray-50 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
								/>
							</div>

							<!-- Email (Read-only) -->
							<div class="space-y-2">
								<label for="email" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
									<Mail class="w-4 h-4 text-cyan-500" />
									Correo electrónico
								</label>
								<Input
									id="email"
									type="email"
									value={email}
									disabled
									class="h-12 bg-gray-100 border-gray-200 cursor-not-allowed"
								/>
								<p class="text-xs text-gray-500 flex items-center gap-1">
									<AlertCircle class="w-3 h-3" />
									El correo no se puede modificar
								</p>
							</div>

							<!-- Bio -->
							<div class="space-y-2">
								<label for="bio" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
									<svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Biografía
								</label>
								<textarea
									id="bio"
									bind:value={bio}
									placeholder="Cuéntanos algo sobre ti..."
									oninput={() => (isEditing = true)}
									rows="4"
									class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors resize-none"
								></textarea>
								<p class="text-xs text-gray-500">{bio.length} caracteres</p>
							</div>

							<Separator class="my-6" />

							<!-- Action Buttons -->
							<div class="flex items-center gap-3 pt-2">
								<Button
									type="submit"
									disabled={viewModel.loading || !isEditing}
									class="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{#if viewModel.loading}
										<Loader2 class="w-5 h-5 mr-2 animate-spin" />
										Guardando...
									{:else}
										<Save class="w-5 h-5 mr-2" />
										Guardar Cambios
									{/if}
								</Button>

								{#if isEditing}
									<Button
										type="button"
										onclick={handleCancel}
										disabled={viewModel.loading}
										variant="outline"
										class="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
									>
										Cancelar
									</Button>
								{/if}
							</div>
						</form>
					</Card>

					<!-- Account Info Card -->
					<Card class="mt-6 p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg border-0">
						<h3 class="text-lg font-bold text-gray-900 mb-4">Información de la Cuenta</h3>
						
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-gray-500 mb-1">Fecha de registro</p>
								<p class="font-semibold text-gray-900">
									{viewModel.currentUser?.createdAt 
										? new Date(viewModel.currentUser.createdAt).toLocaleDateString('es-ES', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
										})
										: 'N/A'}
								</p>
							</div>
							
							<div>
								<p class="text-gray-500 mb-1">Última actualización</p>
								<p class="font-semibold text-gray-900">
									{viewModel.currentUser?.updatedAt 
										? new Date(viewModel.currentUser.updatedAt).toLocaleDateString('es-ES', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
										})
										: 'N/A'}
								</p>
							</div>

							<div>
								<p class="text-gray-500 mb-1">Estado de la cuenta</p>
								<div class="flex items-center gap-2">
									{#if viewModel.currentUser?.isBanned}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
											<span class="w-2 h-2 bg-red-500 rounded-full"></span>
											Suspendida
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
											<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
											Activa
										</span>
									{/if}
								</div>
							</div>

							<div>
								<p class="text-gray-500 mb-1">Rol</p>
								<p class="font-semibold text-gray-900">
									{viewModel.currentUser?.isModerator ? 'Moderador' : 'Usuario'}
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animaciones personalizadas */
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in-from-top {
		from {
			transform: translateY(-1rem);
		}
		to {
			transform: translateY(0);
		}
	}

	.animate-in {
		animation: fade-in 0.3s ease-out, slide-in-from-top 0.3s ease-out;
	}
</style>
