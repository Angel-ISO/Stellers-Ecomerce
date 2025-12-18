import RestServices from '$lib/services/RestServices';
import type { ProductOutput, CreateProductInput, UpdateProductInput, PaginatedProductOutput } from '$lib/models/Products/ProductType';
import { config } from '$lib/config/env';

class ProductService {

	private readonly baseUrl = config.backendUrl;

	public async getProducts(params?: any): Promise<PaginatedProductOutput | ProductOutput[]> {
		return RestServices.get<PaginatedProductOutput | ProductOutput[]>(this.baseUrl + '/products', params);
	}

	public async getProduct(id: string): Promise<ProductOutput> {
		return RestServices.get<ProductOutput>(this.baseUrl + `/products/${id}`);
	}

	public async createProduct(data: CreateProductInput): Promise<{ data: ProductOutput }> {
		return RestServices.post<{ data: ProductOutput }>(this.baseUrl + '/products', data);
	}

	public async updateProduct(id: string, data: UpdateProductInput): Promise<{ data: ProductOutput }> {
		return RestServices.put<{ data: ProductOutput }>(this.baseUrl + `/products/${id}`, data);
	}

	public async deleteProduct(id: string): Promise<void> {
		return RestServices.delete<void>(this.baseUrl + `/products/${id}`);
	}

	public async getMyStoreProducts(): Promise<ProductOutput[]> {
		return RestServices.get<ProductOutput[]>(this.baseUrl + '/products/my-store/products');
	}

}

const productService = new ProductService();

export default productService;