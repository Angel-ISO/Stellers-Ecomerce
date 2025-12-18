import config from '$lib/config/env';
import type { PaginatedUsersResponse, UpdateUserData, User } from '$lib/models/Users/UserType';
import AuthService from '$lib/services/Auth/Auth.service';

export class UserService {
	private static readonly BASE_URL = `${config.backendUrl}/user`;

	/**
	 * Obtiene el token de autenticación del backend
	 */
	private static getAuthToken(): string | null {
		return AuthService.getToken();
	}

	/**
	 * Maneja errores de las peticiones
	 */
	private static async handleResponse(response: Response): Promise<any> {
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData.message || `Error: ${response.status}`;

			// Si es error 401, el token es inválido
			if (response.status === 401) {
				throw new Error('authentication_error: ' + errorMessage);
			}

			throw new Error(errorMessage);
		}

		const data = await response.json();
		return data.data || data;
	}

	/**
	 * Obtiene todos los usuarios con paginación (solo moderadores)
	 * @param pageIndex - Índice de la página (opcional)
	 * @param pageSize - Tamaño de la página (opcional)
	 * @param search - Término de búsqueda (opcional)
	 */
	static async getAllUsers(
		pageIndex?: number,
		pageSize?: number,
		search?: string
	): Promise<PaginatedUsersResponse> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const queryParams = new URLSearchParams();
			if (pageIndex !== undefined) queryParams.append('pageIndex', pageIndex.toString());
			if (pageSize !== undefined) queryParams.append('pageSize', pageSize.toString());
			if (search) queryParams.append('search', search);

			const url = `${this.BASE_URL}?${queryParams.toString()}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			return await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error fetching users:', err);
			throw err;
		}
	}

	/**
	 * Obtiene un usuario por su ID
	 * @param userId - ID del usuario
	 */
	static async getUserById(userId: string): Promise<User | null> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.status === 404) {
				return null;
			}

			return await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error fetching user:', err);
			throw err;
		}
	}

	/**
	 * Actualiza los datos de un usuario
	 * @param userId - ID del usuario
	 * @param userData - Datos a actualizar
	 */
	static async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});

			return await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error updating user:', err);
			throw err;
		}
	}

	/**
	 * Sube o actualiza el avatar del usuario actual
	 * @param file - Archivo de imagen (PNG, JPEG, WebP) - Máx 2MB
	 */
	static async uploadAvatar(file: File): Promise<string> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const formData = new FormData();
			formData.append('avatar', file);

			const response = await fetch(`${this.BASE_URL}/avatar`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
					// No establecer Content-Type, el navegador lo hará automáticamente con boundary
				},
				body: formData
			});

			const data = await this.handleResponse(response);
			return data.avatarUrl as string;
		} catch (err: any) {
			console.error('Error uploading avatar:', err);
			throw err;
		}
	}

	/**
	 * Elimina un usuario (cuenta propia o moderador)
	 * @param userId - ID del usuario a eliminar
	 */
	static async deleteUser(userId: string): Promise<void> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error deleting user:', err);
			throw err;
		}
	}

	/**
	 * Banea a un usuario (solo moderadores)
	 * @param userId - ID del usuario a banear
	 */
	static async banUser(userId: string): Promise<void> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}/ban`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error banning user:', err);
			throw err;
		}
	}

	/**
	 * Desbanea a un usuario (solo moderadores)
	 * @param userId - ID del usuario a desbanear
	 */
	static async unbanUser(userId: string): Promise<void> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}/unban`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error unbanning user:', err);
			throw err;
		}
	}

	/**
	 * Otorga permisos de moderador a un usuario (solo moderadores)
	 * @param userId - ID del usuario a promover
	 */
	static async giveModeratorStatus(userId: string): Promise<void> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}/givemod`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error giving moderator status:', err);
			throw err;
		}
	}

	/**
	 * Remueve permisos de moderador a un usuario (solo moderadores)
	 * @param userId - ID del usuario a degradar
	 */
	static async removeModeratorStatus(userId: string): Promise<void> {
		try {
			const token = this.getAuthToken();
			if (!token) {
				throw new Error('authentication_error: No authentication token found');
			}

			const response = await fetch(`${this.BASE_URL}/${userId}/unmod`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			await this.handleResponse(response);
		} catch (err: any) {
			console.error('Error removing moderator status:', err);
			throw err;
		}
	}
}

export default UserService;
