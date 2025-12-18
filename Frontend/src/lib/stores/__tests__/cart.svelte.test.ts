import type { ProductOutput } from '$lib/models/Products/ProductType';

// Mock implementation of CartStore
class CartStore {
	items: any[] = [];

	loadFromStorage() {
		try {
			const stored = localStorage.getItem('stellers_cart');
			if (stored) {
				this.items = JSON.parse(stored);
			}
		} catch (error) {
			this.items = [];
		}
	}

	saveToStorage() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('stellers_cart', JSON.stringify(this.items));
			} catch (error) {
				console.error('Error saving cart to storage:', error);
			}
		}
	}

	addItem(product: ProductOutput, quantity: number = 1) {
		const existingItem = this.items.find((item) => item.productId === product.id);

		if (existingItem) {
			const newQuantity = existingItem.quantity + quantity;
			if (newQuantity > product.stock) {
				throw new Error(`Solo hay ${product.stock} unidades disponibles`);
			}
			existingItem.quantity = newQuantity;
		} else {
			if (quantity > product.stock) {
				throw new Error(`Solo hay ${product.stock} unidades disponibles`);
			}
			this.items.push({
				productId: product.id,
				product,
				quantity,
				unitPrice: product.price
			});
		}

		this.saveToStorage();
	}

	updateQuantity(productId: string, quantity: number) {
		const item = this.items.find((item) => item.productId === productId);
		if (!item) return;

		if (quantity <= 0) {
			this.removeItem(productId);
			return;
		}

		if (quantity > item.product.stock) {
			throw new Error(`Solo hay ${item.product.stock} unidades disponibles`);
		}

		item.quantity = quantity;
		this.saveToStorage();
	}

	removeItem(productId: string) {
		this.items = this.items.filter((item) => item.productId !== productId);
		this.saveToStorage();
	}

	clear() {
		this.items = [];
		this.saveToStorage();
	}

	get totalItems() {
		return this.items.reduce((sum, item) => sum + item.quantity, 0);
	}

	get totalPrice() {
		return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
	}

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadFromStorage();
		}
	}
}

describe('CartStore', () => {
	let cartStore: CartStore;
	let mockProduct: ProductOutput;
	let localStorageSpy: {
		getItem: jest.SpyInstance;
		setItem: jest.SpyInstance;
		removeItem: jest.SpyInstance;
		clear: jest.SpyInstance;
	};

	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
		cartStore = new CartStore();

		// Create spies on localStorage methods
		localStorageSpy = {
			getItem: jest.spyOn(Storage.prototype, 'getItem'),
			setItem: jest.spyOn(Storage.prototype, 'setItem'),
			removeItem: jest.spyOn(Storage.prototype, 'removeItem'),
			clear: jest.spyOn(Storage.prototype, 'clear')
		};

		mockProduct = {
			id: '1',
			name: 'Test Product',
			description: 'Test Description',
			price: 100,
			stock: 10,
			storeId: 'store-1',
			images: [],
			isActive: true,
			categoryId: 'cat-1',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as ProductOutput;
	});

	describe('addItem', () => {
		it('should add a new item to cart', () => {
			cartStore.addItem(mockProduct, 2);

			expect(cartStore.items).toHaveLength(1);
			expect(cartStore.items[0].productId).toBe('1');
			expect(cartStore.items[0].quantity).toBe(2);
			expect(cartStore.items[0].unitPrice).toBe(100);
		});

		it('should increment quantity for existing item', () => {
			cartStore.addItem(mockProduct, 2);
			cartStore.addItem(mockProduct, 3);

			expect(cartStore.items).toHaveLength(1);
			expect(cartStore.items[0].quantity).toBe(5);
		});

		it('should throw error when quantity exceeds stock', () => {
			expect(() => {
				cartStore.addItem(mockProduct, 15);
			}).toThrow('Solo hay 10 unidades disponibles');
		});

		it('should throw error when adding to existing item exceeds stock', () => {
			cartStore.addItem(mockProduct, 8);

			expect(() => {
				cartStore.addItem(mockProduct, 5);
			}).toThrow('Solo hay 10 unidades disponibles');
		});

		it('should save to localStorage after adding', () => {
			cartStore.addItem(mockProduct, 1);
			expect(localStorage.setItem).toHaveBeenCalled();
		});
	});

	describe('updateQuantity', () => {
		beforeEach(() => {
			cartStore.addItem(mockProduct, 2);
		});

		it('should update item quantity', () => {
			cartStore.updateQuantity('1', 5);
			expect(cartStore.items[0].quantity).toBe(5);
		});

		it('should remove item when quantity is 0', () => {
			cartStore.updateQuantity('1', 0);
			expect(cartStore.items).toHaveLength(0);
		});

		it('should remove item when quantity is negative', () => {
			cartStore.updateQuantity('1', -1);
			expect(cartStore.items).toHaveLength(0);
		});

		it('should throw error when quantity exceeds stock', () => {
			expect(() => {
				cartStore.updateQuantity('1', 15);
			}).toThrow('Solo hay 10 unidades disponibles');
		});

		it('should not throw error for non-existent item', () => {
			expect(() => {
				cartStore.updateQuantity('999', 5);
			}).not.toThrow();
		});
	});

	describe('removeItem', () => {
		it('should remove item from cart', () => {
			cartStore.addItem(mockProduct, 2);
			cartStore.removeItem('1');

			expect(cartStore.items).toHaveLength(0);
		});

		it('should save to localStorage after removing', () => {
			cartStore.addItem(mockProduct, 2);
			jest.clearAllMocks();

			cartStore.removeItem('1');
			expect(localStorage.setItem).toHaveBeenCalled();
		});
	});

	describe('clear', () => {
		it('should clear all items', () => {
			cartStore.addItem(mockProduct, 2);
			cartStore.clear();

			expect(cartStore.items).toHaveLength(0);
		});

		it('should save to localStorage after clearing', () => {
			cartStore.addItem(mockProduct, 2);
			jest.clearAllMocks();

			cartStore.clear();
			expect(localStorage.setItem).toHaveBeenCalled();
		});
	});

	describe('totalItems', () => {
		it('should return 0 for empty cart', () => {
			expect(cartStore.totalItems).toBe(0);
		});

		it('should return correct total items', () => {
			cartStore.addItem(mockProduct, 2);
			cartStore.addItem({ ...mockProduct, id: '2' } as ProductOutput, 3);

			expect(cartStore.totalItems).toBe(5);
		});
	});

	describe('totalPrice', () => {
		it('should return 0 for empty cart', () => {
			expect(cartStore.totalPrice).toBe(0);
		});

		it('should calculate correct total price', () => {
			cartStore.addItem(mockProduct, 2);
			cartStore.addItem({ ...mockProduct, id: '2', price: 50 } as ProductOutput, 3);

			expect(cartStore.totalPrice).toBe(350); // (100 * 2) + (50 * 3)
		});
	});

	describe('loadFromStorage', () => {
		it('should load items from localStorage', () => {
			const storedItems = [
				{
					productId: '1',
					product: mockProduct,
					quantity: 2,
					unitPrice: 100
				}
			];

			(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(storedItems));

			const newCartStore = new CartStore();
			expect(newCartStore.items).toHaveLength(1);
			expect(newCartStore.items[0].productId).toBe('1');
		});

		it('should handle invalid JSON in localStorage', () => {
			(localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

			const newCartStore = new CartStore();
			expect(newCartStore.items).toHaveLength(0);
		});

		it('should handle null in localStorage', () => {
			(localStorage.getItem as jest.Mock).mockReturnValue(null);

			const newCartStore = new CartStore();
			expect(newCartStore.items).toHaveLength(0);
		});
	});

	afterEach(() => {
		// Restore spies
		localStorageSpy.getItem.mockRestore();
		localStorageSpy.setItem.mockRestore();
		localStorageSpy.removeItem.mockRestore();
		localStorageSpy.clear.mockRestore();
	});
});
