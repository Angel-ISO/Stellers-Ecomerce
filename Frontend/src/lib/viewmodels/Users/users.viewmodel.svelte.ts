import type { UpdateUserData, User } from '$lib/models/Users/UserType';
import { UserService } from '$lib/services/User/User.service';

/**
 * ViewModel para gestionar usuarios
 */
export class UsersViewModel {
	// Estados reactivos
	users = $state<User[]>([]);
	currentUser = $state<User | null>(null);
	loading = $state<boolean>(false);
	error = $state<string | null>(null);

	// Estados de paginación
	pagination = $state<{
		total: number;
		pageIndex: number;
		pageSize: number;
		totalPages: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	}>({
		total: 0,
		pageIndex: 0,
		pageSize: 10,
		totalPages: 0,
		hasPreviousPage: false,
		hasNextPage: false
	});

	search = $state<string>('');

	/**
	 * Carga todos los usuarios con paginación (solo para moderadores)
	 */
	async loadUsers(pageIndex?: number, pageSize?: number, search?: string): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const response = await UserService.getAllUsers(
				pageIndex ?? this.pagination.pageIndex,
				pageSize ?? this.pagination.pageSize,
				search ?? this.search
			);

			this.users = response.registers;
			this.pagination = {
				total: response.total,
				pageIndex: response.pageIndex,
				pageSize: response.pageSize,
				totalPages: response.totalPages,
				hasPreviousPage: response.hasPreviousPage,
				hasNextPage: response.hasNextPage
			};
		} catch (err: any) {
			this.error = err.message || 'Error al cargar usuarios';
			console.error('Error loading users:', err);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Carga un usuario por su ID
	 */
	async loadUserById(userId: string): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const user = await UserService.getUserById(userId);
			this.currentUser = user;
		} catch (err: any) {
			this.error = err.message || 'Error al cargar usuario';
			console.error('Error loading user:', err);
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Actualiza un usuario
	 */
	async updateUser(userId: string, userData: UpdateUserData): Promise<boolean> {
		this.loading = true;
		this.error = null;

		try {
			const updatedUser = await UserService.updateUser(userId, userData);

			// Actualizar el usuario en la lista si existe
			const index = this.users.findIndex((u) => u.id === userId);
			if (index !== -1) {
				this.users[index] = updatedUser;
			}

			// Actualizar el usuario actual si es el mismo
			if (this.currentUser?.id === userId) {
				this.currentUser = updatedUser;
			}

			return true;
		} catch (err: any) {
			this.error = err.message || 'Error al actualizar usuario';
			console.error('Error updating user:', err);
			return false;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Sube un avatar para el usuario actual
	 */
	async uploadAvatar(file: File): Promise<string | null> {
		this.loading = true;
		this.error = null;

		try {
			const avatarUrl = await UserService.uploadAvatar(file);
			return avatarUrl;
		} catch (err: any) {
			this.error = err.message || 'Error al subir avatar';
			console.error('Error uploading avatar:', err);
			return null;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Elimina un usuario
	 */
	async deleteUser(userId: string): Promise<boolean> {
		this.loading = true;
		this.error = null;

		try {
			await UserService.deleteUser(userId);

			// Eliminar el usuario de la lista
			this.users = this.users.filter((u) => u.id !== userId);

			// Limpiar el usuario actual si es el mismo
			if (this.currentUser?.id === userId) {
				this.currentUser = null;
			}

			return true;
		} catch (err: any) {
			this.error = err.message || 'Error al eliminar usuario';
			console.error('Error deleting user:', err);
			return false;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Cambia a la página siguiente
	 */
	async nextPage(): Promise<void> {
		if (this.pagination.hasNextPage) {
			await this.loadUsers(this.pagination.pageIndex + 1);
		}
	}

	/**
	 * Cambia a la página anterior
	 */
	async previousPage(): Promise<void> {
		if (this.pagination.hasPreviousPage) {
			await this.loadUsers(this.pagination.pageIndex - 1);
		}
	}

	/**
	 * Busca usuarios por término
	 */
	async searchUsers(searchTerm: string): Promise<void> {
		this.search = searchTerm;
		await this.loadUsers(0, this.pagination.pageSize, searchTerm);
	}

	/**
	 * Limpia el error actual
	 */
	clearError(): void {
		this.error = null;
	}

	/**
	 * Resetea el estado del viewmodel
	 */
	reset(): void {
		this.users = [];
		this.currentUser = null;
		this.loading = false;
		this.error = null;
		this.search = '';
		this.pagination = {
			total: 0,
			pageIndex: 0,
			pageSize: 10,
			totalPages: 0,
			hasPreviousPage: false,
			hasNextPage: false
		};
	}
}
