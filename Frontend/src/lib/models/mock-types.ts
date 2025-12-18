
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
	id: string;
	name: string;
	email: string;
	phone?: string;
	role: UserRole;
	avatar?: string;
	createdAt: Date;
}


export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	category: string;
	stock: number;
	sales: number;
	images: string[];
	rating: number;
	reviews: number;
	status: 'active' | 'out_of_stock' | 'low_stock' | 'inactive';
	sellerId: string;
	createdAt: Date;
	updatedAt: Date;
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderItem {
	productId: string;
	productName: string;
	productImage: string;
	quantity: number;
	price: number;
	subtotal: number;
}

export interface Order {
	id: string;
	orderNumber: string;
	customerId: string;
	customerName: string;
	customerEmail: string;
	items: OrderItem[];
	subtotal: number;
	tax: number;
	shipping: number;
	total: number;
	status: OrderStatus;
	paymentMethod: string;
	shippingAddress: Address;
	createdAt: Date;
	updatedAt: Date;
}


export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	avatar?: string;
	totalOrders: number;
	totalSpent: number;
	addresses: Address[];
	createdAt: Date;
	lastOrderAt?: Date;
}


export interface CartItem {
	productId: string;
	productName: string;
	productImage: string;
	price: number;
	quantity: number;
}

export interface Cart {
	items: CartItem[];
	subtotal: number;
	total: number;
}


export interface WishlistItem {
	productId: string;
	productName: string;
	productImage: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	inStock: boolean;
	addedAt: Date;
}

// Stats types
export interface DashboardStats {
	totalRevenue: number;
	totalOrders: number;
	totalProducts: number;
	totalCustomers: number;
	conversionRate: number;
	revenueGrowth: number;
	ordersGrowth: number;
}

// Payment types
export interface PaymentMethod {
	id: string;
	type: 'card' | 'paypal' | 'bank_transfer';
	last4?: string;
	cardBrand?: string;
	expiryMonth?: number;
	expiryYear?: number;
	isDefault: boolean;
}
