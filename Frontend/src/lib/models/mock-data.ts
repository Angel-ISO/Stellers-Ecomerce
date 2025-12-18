import type {
	Product,
	Order,
	Customer,
	DashboardStats,
	WishlistItem,
	CartItem
} from './mock-types';

export const mockProducts: Product[] = [
	{
		id: 'prod-1',
		name: 'Galaxy S22 Ultra',
		description: 'Premium smartphone with advanced camera system',
		price: 799,
		originalPrice: 999,
		discount: 20,
		category: 'Smartphones',
		stock: 25,
		sales: 142,
		images: ['https://picsum.photos/seed/product1/400/400'],
		rating: 4.8,
		reviews: 234,
		status: 'active',
		sellerId: 'seller-1',
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-20')
	},
	{
		id: 'prod-2',
		name: 'iPhone 14 Pro',
		description: 'Latest iPhone with A16 Bionic chip',
		price: 999,
		originalPrice: 1099,
		discount: 9,
		category: 'Smartphones',
		stock: 15,
		sales: 198,
		images: ['https://picsum.photos/seed/product2/400/400'],
		rating: 4.9,
		reviews: 567,
		status: 'active',
		sellerId: 'seller-1',
		createdAt: new Date('2025-01-02'),
		updatedAt: new Date('2025-01-21')
	},
	{
		id: 'prod-3',
		name: 'Wireless Headphones Pro',
		description: 'Premium noise cancelling headphones',
		price: 149,
		originalPrice: 199,
		discount: 25,
		category: 'Audio',
		stock: 0,
		sales: 89,
		images: ['https://picsum.photos/seed/product3/400/400'],
		rating: 4.5,
		reviews: 123,
		status: 'out_of_stock',
		sellerId: 'seller-1',
		createdAt: new Date('2025-01-03'),
		updatedAt: new Date('2025-01-22')
	},
	{
		id: 'prod-4',
		name: 'Smart Watch Pro',
		description: 'Advanced fitness and health tracking',
		price: 299,
		originalPrice: 349,
		discount: 14,
		category: 'Wearables',
		stock: 42,
		sales: 156,
		images: ['https://picsum.photos/seed/product4/400/400'],
		rating: 4.7,
		reviews: 289,
		status: 'active',
		sellerId: 'seller-1',
		createdAt: new Date('2025-01-04'),
		updatedAt: new Date('2025-01-23')
	},
	{
		id: 'prod-5',
		name: 'Laptop Stand Premium',
		description: 'Ergonomic aluminum laptop stand',
		price: 49,
		originalPrice: 69,
		discount: 29,
		category: 'Accessories',
		stock: 8,
		sales: 67,
		images: ['https://picsum.photos/seed/product5/400/400'],
		rating: 4.3,
		reviews: 45,
		status: 'low_stock',
		sellerId: 'seller-1',
		createdAt: new Date('2025-01-05'),
		updatedAt: new Date('2025-01-24')
	},
	{
		id: 'prod-6',
		name: 'MacBook Pro 16"',
		description: 'Professional laptop with M3 Pro chip',
		price: 2499,
		originalPrice: 2899,
		discount: 14,
		category: 'Laptops',
		stock: 12,
		sales: 45,
		images: ['https://picsum.photos/seed/product6/400/400'],
		rating: 4.9,
		reviews: 178,
		status: 'active',
		sellerId: 'seller-2',
		createdAt: new Date('2025-01-06'),
		updatedAt: new Date('2025-01-25')
	},
	{
		id: 'prod-7',
		name: 'Gaming Console X',
		description: 'Next-gen gaming console',
		price: 499,
		originalPrice: 599,
		discount: 17,
		category: 'Gaming',
		stock: 0,
		sales: 234,
		images: ['https://picsum.photos/seed/product7/400/400'],
		rating: 4.8,
		reviews: 456,
		status: 'out_of_stock',
		sellerId: 'seller-2',
		createdAt: new Date('2025-01-07'),
		updatedAt: new Date('2025-01-26')
	},
	{
		id: 'prod-8',
		name: '4K Camera Drone',
		description: 'Professional drone with 4K camera',
		price: 699,
		originalPrice: 899,
		discount: 22,
		category: 'Electronics',
		stock: 18,
		sales: 78,
		images: ['https://picsum.photos/seed/product8/400/400'],
		rating: 4.6,
		reviews: 134,
		status: 'active',
		sellerId: 'seller-2',
		createdAt: new Date('2025-01-08'),
		updatedAt: new Date('2025-01-27')
	}
];

export const mockOrders: Order[] = [
	{
		id: 'order-1',
		orderNumber: '#ORD-2341',
		customerId: 'cust-1',
		customerName: 'John Doe',
		customerEmail: 'john@example.com',
		items: [
			{
				productId: 'prod-1',
				productName: 'Galaxy S22 Ultra',
				productImage: 'https://picsum.photos/seed/order1/100/100',
				quantity: 1,
				price: 799,
				subtotal: 799
			},
			{
				productId: 'prod-3',
				productName: 'Wireless Headphones',
				productImage: 'https://picsum.photos/seed/order1b/100/100',
				quantity: 1,
				price: 149,
				subtotal: 149
			}
		],
		subtotal: 948,
		tax: 75.84,
		shipping: 15,
		total: 1038.84,
		status: 'delivered',
		paymentMethod: 'Credit Card',
		shippingAddress: {
			street: '123 Main St',
			city: 'New York',
			state: 'NY',
			zipCode: '10001',
			country: 'USA'
		},
		createdAt: new Date('2025-01-15'),
		updatedAt: new Date('2025-01-20')
	},
	{
		id: 'order-2',
		orderNumber: '#ORD-2342',
		customerId: 'cust-2',
		customerName: 'Jane Smith',
		customerEmail: 'jane@example.com',
		items: [
			{
				productId: 'prod-2',
				productName: 'iPhone 14 Pro',
				productImage: 'https://picsum.photos/seed/order2/100/100',
				quantity: 1,
				price: 999,
				subtotal: 999
			}
		],
		subtotal: 999,
		tax: 79.92,
		shipping: 15,
		total: 1093.92,
		status: 'in_transit',
		paymentMethod: 'PayPal',
		shippingAddress: {
			street: '456 Oak Ave',
			city: 'Los Angeles',
			state: 'CA',
			zipCode: '90001',
			country: 'USA'
		},
		createdAt: new Date('2025-01-14'),
		updatedAt: new Date('2025-01-18')
	},
	{
		id: 'order-3',
		orderNumber: '#ORD-2343',
		customerId: 'cust-3',
		customerName: 'Bob Johnson',
		customerEmail: 'bob@example.com',
		items: [
			{
				productId: 'prod-4',
				productName: 'Smart Watch Pro',
				productImage: 'https://picsum.photos/seed/order3/100/100',
				quantity: 1,
				price: 299,
				subtotal: 299
			}
		],
		subtotal: 299,
		tax: 23.92,
		shipping: 10,
		total: 332.92,
		status: 'processing',
		paymentMethod: 'Credit Card',
		shippingAddress: {
			street: '789 Pine Rd',
			city: 'Chicago',
			state: 'IL',
			zipCode: '60601',
			country: 'USA'
		},
		createdAt: new Date('2025-01-12'),
		updatedAt: new Date('2025-01-12')
	},
	{
		id: 'order-4',
		orderNumber: '#ORD-2344',
		customerId: 'cust-4',
		customerName: 'Alice Brown',
		customerEmail: 'alice@example.com',
		items: [
			{
				productId: 'prod-6',
				productName: 'MacBook Pro 16"',
				productImage: 'https://picsum.photos/seed/order4/100/100',
				quantity: 1,
				price: 2499,
				subtotal: 2499
			}
		],
		subtotal: 2499,
		tax: 199.92,
		shipping: 0,
		total: 2698.92,
		status: 'pending',
		paymentMethod: 'Credit Card',
		shippingAddress: {
			street: '321 Elm St',
			city: 'Miami',
			state: 'FL',
			zipCode: '33101',
			country: 'USA'
		},
		createdAt: new Date('2025-01-10'),
		updatedAt: new Date('2025-01-10')
	}
];

export const mockCustomers: Customer[] = [
	{
		id: 'cust-1',
		name: 'John Doe',
		email: 'john@example.com',
		phone: '+1 (555) 123-4567',
		avatar: undefined,
		totalOrders: 24,
		totalSpent: 12426,
		addresses: [
			{
				street: '123 Main St',
				city: 'New York',
				state: 'NY',
				zipCode: '10001',
				country: 'USA'
			}
		],
		createdAt: new Date('2024-06-15'),
		lastOrderAt: new Date('2025-01-15')
	},
	{
		id: 'cust-2',
		name: 'Jane Smith',
		email: 'jane@example.com',
		phone: '+1 (555) 234-5678',
		avatar: undefined,
		totalOrders: 18,
		totalSpent: 8934,
		addresses: [
			{
				street: '456 Oak Ave',
				city: 'Los Angeles',
				state: 'CA',
				zipCode: '90001',
				country: 'USA'
			}
		],
		createdAt: new Date('2024-07-20'),
		lastOrderAt: new Date('2025-01-14')
	},
	{
		id: 'cust-3',
		name: 'Bob Johnson',
		email: 'bob@example.com',
		phone: '+1 (555) 345-6789',
		avatar: undefined,
		totalOrders: 12,
		totalSpent: 5678,
		addresses: [
			{
				street: '789 Pine Rd',
				city: 'Chicago',
				state: 'IL',
				zipCode: '60601',
				country: 'USA'
			}
		],
		createdAt: new Date('2024-08-10'),
		lastOrderAt: new Date('2025-01-12')
	},
	{
		id: 'cust-4',
		name: 'Alice Brown',
		email: 'alice@example.com',
		phone: '+1 (555) 456-7890',
		avatar: undefined,
		totalOrders: 8,
		totalSpent: 4523,
		addresses: [
			{
				street: '321 Elm St',
				city: 'Miami',
				state: 'FL',
				zipCode: '33101',
				country: 'USA'
			}
		],
		createdAt: new Date('2024-09-05'),
		lastOrderAt: new Date('2025-01-10')
	},
	{
		id: 'cust-5',
		name: 'Charlie Wilson',
		email: 'charlie@example.com',
		phone: '+1 (555) 567-8901',
		avatar: undefined,
		totalOrders: 15,
		totalSpent: 7891,
		addresses: [
			{
				street: '654 Maple Dr',
				city: 'Seattle',
				state: 'WA',
				zipCode: '98101',
				country: 'USA'
			}
		],
		createdAt: new Date('2024-10-12'),
		lastOrderAt: new Date('2025-01-08')
	}
];

export const mockDashboardStats: DashboardStats = {
	totalRevenue: 48567,
	totalOrders: 156,
	totalProducts: 48,
	totalCustomers: 342,
	conversionRate: 3.2,
	revenueGrowth: 12.5,
	ordersGrowth: 8.2
};

export const mockWishlist: WishlistItem[] = [
	{
		productId: 'prod-6',
		productName: 'MacBook Pro 16"',
		productImage: 'https://picsum.photos/seed/wish1/150/150',
		price: 2499,
		originalPrice: 2899,
		discount: 14,
		inStock: true,
		addedAt: new Date('2025-01-10')
	},
	{
		productId: 'prod-8',
		productName: '4K Camera Drone',
		productImage: 'https://picsum.photos/seed/wish2/150/150',
		price: 699,
		originalPrice: 899,
		discount: 22,
		inStock: true,
		addedAt: new Date('2025-01-12')
	},
	{
		productId: 'prod-7',
		productName: 'Gaming Console X',
		productImage: 'https://picsum.photos/seed/wish3/150/150',
		price: 499,
		originalPrice: 599,
		discount: 17,
		inStock: false,
		addedAt: new Date('2025-01-14')
	}
];

export const mockCart: CartItem[] = [
	{
		productId: 'prod-1',
		productName: 'Galaxy S22 Ultra',
		productImage: 'https://picsum.photos/seed/cart1/100/100',
		price: 799,
		quantity: 1
	},
	{
		productId: 'prod-4',
		productName: 'Smart Watch Pro',
		productImage: 'https://picsum.photos/seed/cart2/100/100',
		price: 299,
		quantity: 2
	},
	{
		productId: 'prod-5',
		productName: 'Laptop Stand Premium',
		productImage: 'https://picsum.photos/seed/cart3/100/100',
		price: 49,
		quantity: 1
	}
];
