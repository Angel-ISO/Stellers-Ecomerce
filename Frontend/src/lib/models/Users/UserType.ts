export interface User {
	id: string;
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
	isModerator: boolean;
	isBanned: boolean;
	preferences?: any;
	createdAt: Date;
	updatedAt: Date;
	email?: string;
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserData {
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
	isModerator?: boolean;
	isBanned?: boolean;
	preferences?: any;
}

/**
 * Respuesta paginada de usuarios
 */
export interface PaginatedUsersResponse {
	registers: User[];
	total: number;
	pageIndex: number;
	pageSize: number;
	search?: string;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}
