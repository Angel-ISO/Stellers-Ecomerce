import type { ProductOutput } from '$lib/models/Products/ProductType';

export interface CartItem {
	productId: string;
	product: ProductOutput;
	quantity: number;
	unitPrice: number;
}

const CART_STORAGE_KEY = 'stellers_cart';

class CartStore {
	items = $state<CartItem[]>([]);

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadFromStorage();
		}
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(CART_STORAGE_KEY);
			if (stored) {
				this.items = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Error loading cart from storage:', error);
			this.items = [];
		}
	}

	private saveToStorage() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
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

	get isEmpty() {
		return this.items.length === 0;
	}

	getItem(productId: string): CartItem | undefined {
		return this.items.find((item) => item.productId === productId);
	}
}

export const cartStore = new CartStore();

