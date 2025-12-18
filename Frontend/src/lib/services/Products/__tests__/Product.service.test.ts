import type {
	CreateProductInput,
	ProductOutput,
	UpdateProductInput
} from '$lib/models/Products/ProductType';
import RestServices from '$lib/services/RestServices';
import productService from '../Product.service';

jest.mock('$lib/services/RestServices');

describe('ProductService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getProducts', () => {
		it('should fetch all products', async () => {
			const mockProducts: ProductOutput[] = [
				{
					id: '1',
					name: 'Product 1',
					description: 'Description 1',
					price: 100,
					stock: 10,
					storeId: 'store-1',
					images: [],
					sold: 0,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];
			(RestServices.get as jest.Mock).mockResolvedValue(mockProducts);

			const result = await productService.getProducts();

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/products', undefined);
			expect(result).toEqual(mockProducts);
		});

		it('should fetch products with params', async () => {
			const params = { page: 1, limit: 10 };
			const mockResponse = { data: [], total: 0 };
			(RestServices.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await productService.getProducts(params);

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/products', params);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getProduct', () => {
		it('should fetch a single product by id', async () => {
			const mockProduct: ProductOutput = {
				id: '1',
				name: 'Product 1',
				description: 'Description 1',
				price: 100,
				stock: 10,
				storeId: 'store-1',
				images: [],
				sold: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockProduct);

			const result = await productService.getProduct('1');

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/products/1');
			expect(result).toEqual(mockProduct);
		});
	});

	describe('createProduct', () => {
		it('should create a new product', async () => {
			const newProduct: CreateProductInput = {
				name: 'New Product',
				description: 'New Description',
				price: 200,
				stock: 20,
				storeId: 'store-1',
				categoryId: 'category-1'
			};
			const mockResponse = { data: { ...newProduct, id: '2' } as ProductOutput };
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await productService.createProduct(newProduct);

			expect(RestServices.post).toHaveBeenCalledWith('http://localhost:3000/products', newProduct);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateProduct', () => {
		it('should update an existing product', async () => {
			const updateData: UpdateProductInput = {
				name: 'Updated Product',
				price: 150
			};
			const mockResponse = { data: { ...updateData, id: '1' } as ProductOutput };
			(RestServices.put as jest.Mock).mockResolvedValue(mockResponse);

			const result = await productService.updateProduct('1', updateData);

			expect(RestServices.put).toHaveBeenCalledWith('http://localhost:3000/products/1', updateData);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteProduct', () => {
		it('should delete a product', async () => {
			(RestServices.delete as jest.Mock).mockResolvedValue(undefined);

			await productService.deleteProduct('1');

			expect(RestServices.delete).toHaveBeenCalledWith('http://localhost:3000/products/1');
		});
	});

	describe('getMyStoreProducts', () => {
		it('should fetch products from my store', async () => {
			const mockProducts: ProductOutput[] = [
				{
					id: '1',
					name: 'My Product',
					description: 'Description',
					price: 100,
					stock: 10,
					storeId: 'my-store',
					images: [],
					sold: 0,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];
			(RestServices.get as jest.Mock).mockResolvedValue(mockProducts);

			const result = await productService.getMyStoreProducts();

			expect(RestServices.get).toHaveBeenCalledWith(
				'http://localhost:3000/products/my-store/products'
			);
			expect(result).toEqual(mockProducts);
		});
	});
});
