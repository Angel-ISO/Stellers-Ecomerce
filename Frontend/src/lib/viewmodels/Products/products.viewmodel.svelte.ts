import type { ProductOutput, CreateProductInput, UpdateProductInput } from '$lib/models/Products/ProductType';
import productService from '$lib/services/Products/Product.service';

export function createProductsViewModel() {
	let products = $state<ProductOutput[]>([]);
	let isLoading = $state(false);
	let searchQuery = $state('');
	let selectedCategory = $state<string | null>(null);

	const filteredProducts = $derived(() => {
		let filtered = products;

		if (searchQuery) {
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
			);
		}

		if (selectedCategory) {
			filtered = filtered.filter((p) => p.categoryId === selectedCategory);
		}

		return filtered;
	});

	const categories = $derived(() => {
		const cats = new Set(products.map((p) => p.categoryId).filter(Boolean));
		return Array.from(cats);
	});

	const activeProducts = $derived(() => {
		return products.filter((p) => p.isActive).length;
	});

	const outOfStockProducts = $derived(() => {
		return products.filter((p) => p.stock === 0).length;
	});

	const lowStockProducts = $derived(() => {
		return products.filter((p) => p.stock > 0 && p.stock <= 10).length;
	});


	const loadProducts = async () => {
		isLoading = true;
		try {
			let response: any;
			
			const { authState } = await import('$lib/stores/auth.svelte');
			if (authState.isSeller()) {
				response = await productService.getMyStoreProducts();
			} else {
				response = await productService.getProducts();
			}

			if (response?.data?.data && Array.isArray(response.data.data)) {
				products = response.data.data;
			} else if (response?.data && Array.isArray(response.data)) {
				products = response.data;
			} else if (Array.isArray(response)) {
				products = response;
			} else {
				console.warn('Unexpected response format:', response);
				products = [];
			}
		} catch (error) {
			console.error('Error loading products:', error);
			products = [];
		} finally {
			isLoading = false;
		}
	};

	const createProduct = async (product: CreateProductInput) => {
		try {
			const response: any = await productService.createProduct(product);
			let newProduct = null;
			if (response?.data?.data) {
				newProduct = response.data.data;
			} else if (response?.data) {
				newProduct = response.data;
			}

			if (newProduct) {
				products = [...products, newProduct];
			}
		} catch (error) {
			console.error('Error creating product:', error);
			throw error;
		}
	};

	const updateProduct = async (id: string, updates: UpdateProductInput) => {
		try {
			const response: any = await productService.updateProduct(id, updates);
			let updatedProduct = null;
			if (response?.data?.data) {
				updatedProduct = response.data.data;
			} else if (response?.data) {
				updatedProduct = response.data;
			}

			if (updatedProduct) {
				const index = products.findIndex((p) => p.id === id);
				if (index !== -1) {
					products[index] = updatedProduct;
				}
			}
		} catch (error) {
			console.error('Error updating product:', error);
			throw error;
		}
	};

	const deleteProduct = async (id: string) => {
		try {
			await productService.deleteProduct(id);
			products = products.filter((p) => p.id !== id);
		} catch (error) {
			console.error('Error deleting product:', error);
		}
	};

	const getProductStatusColor = (product: ProductOutput): 'success' | 'destructive' | 'warning' | 'secondary' => {
		if (!product.isActive) return 'secondary';
		if (product.stock === 0) return 'destructive';
		if (product.stock <= 10) return 'warning';
		return 'success';
	};

	const getProductStatusLabel = (product: ProductOutput): string => {
		if (!product.isActive) return 'Inactive';
		if (product.stock === 0) return 'Out of Stock';
		if (product.stock <= 10) return 'Low Stock';
		return 'Active';
	};

	return {
		get products() { return products; },
		set products(value) { products = value; },
		get isLoading() { return isLoading; },
		set isLoading(value) { isLoading = value; },
		get searchQuery() { return searchQuery; },
		set searchQuery(value) { searchQuery = value; },
		get selectedCategory() { return selectedCategory; },
		set selectedCategory(value) { selectedCategory = value; },
		filteredProducts,
		categories,
		activeProducts,
		outOfStockProducts,
		lowStockProducts,
		loadProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		getProductStatusColor,
		getProductStatusLabel,
	};
}
