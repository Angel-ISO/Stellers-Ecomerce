import RestServices from '$lib/services/RestServices';
import { config } from '$lib/config/env';

export interface CategoryOutput {
	id: string;
	name: string;
	parentId?: string;
	children?: CategoryOutput[];
}

export interface CreateCategoryInput {
	name: string;
	parentId?: string;
}

export interface UpdateCategoryInput {
	name?: string;
	parentId?: string;
}

class CategoryService {
	private readonly baseUrl = config.backendUrl;

	public async getAllCategories(): Promise<CategoryOutput[]> {
		return RestServices.get<CategoryOutput[]>(`${this.baseUrl}/categories`);
	}

	public async getCategoryById(id: string): Promise<CategoryOutput> {
		return RestServices.get<CategoryOutput>(`${this.baseUrl}/categories/${id}`);
	}

	public async createCategory(data: CreateCategoryInput): Promise<CategoryOutput> {
		return RestServices.post<CategoryOutput>(`${this.baseUrl}/categories`, data);
	}

	public async updateCategory(id: string, data: UpdateCategoryInput): Promise<CategoryOutput> {
		return RestServices.put<CategoryOutput>(`${this.baseUrl}/categories/${id}`, data);
	}

	public async deleteCategory(id: string): Promise<void> {
		return RestServices.delete<void>(`${this.baseUrl}/categories/${id}`);
	}
}

const categoryService = new CategoryService();
export default categoryService;

