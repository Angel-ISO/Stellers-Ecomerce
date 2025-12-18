import type { Chat } from '$lib/models/Chat/ChatType';

export interface ProductOutput {
	id: string;
	storeId: string;
	name: string;
	description?: string;
	price: number;
	stock: number;
	categoryId?: string;
	imageUrls: string[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
	chat?: Chat;
}

export interface CreateProductInput {
	storeId: string;
	name: string;
	description?: string;
	price: number;
	stock: number;
	categoryId?: string;
	imageUrls?: string[];
	isActive?: boolean;
}

export type sortOrder = 'asc' | 'desc';

export type sortBy = 'price' | 'createdAt' | 'name';

export interface FilterProductsInput {
	searchTerm?: string;
	categoryId?: string;
	storeId?: string;
	priceMin?: number;
	priceMax?: number;
	page?: number ;
	limit?: number;
	sortBy?: sortBy;
	sortOrder?: sortOrder;
}

export interface PaginatedProductOutput {
	data: ProductOutput[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface UpdateProductInput {
	name?: string;
	description?: string;
	price?: number;
	stock?: number;
	categoryId?: string;
	imageUrls?: string[];
	isActive?: boolean;
}