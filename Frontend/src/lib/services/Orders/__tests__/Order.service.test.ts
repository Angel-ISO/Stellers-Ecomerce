import type { CreateOrderInput, OrderOutput } from '$lib/models/Orders/OrderType';
import RestServices from '$lib/services/RestServices';
import orderService from '../Order.service';

jest.mock('$lib/services/RestServices');

describe('OrderService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getUserOrders', () => {
		it('should fetch user orders as array', async () => {
			const mockOrders: OrderOutput[] = [
				{
					id: '1',
					buyerId: 'user-1',
					status: 'PENDING',
					totalAmount: 100,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					items: []
				}
			];
			(RestServices.get as jest.Mock).mockResolvedValue(mockOrders);

			const result = await orderService.getUserOrders();

			expect(RestServices.get).toHaveBeenCalled();
			expect(result).toEqual(mockOrders);
		});

		it('should handle response with data property', async () => {
			const mockOrders: OrderOutput[] = [];
			(RestServices.get as jest.Mock).mockResolvedValue({ data: mockOrders });

			const result = await orderService.getUserOrders();

			expect(result).toEqual(mockOrders);
		});
	});

	describe('getSellerOrders', () => {
		it('should fetch seller orders', async () => {
			const mockOrders: OrderOutput[] = [];
			(RestServices.get as jest.Mock).mockResolvedValue(mockOrders);

			const result = await orderService.getSellerOrders();

			expect(RestServices.get).toHaveBeenCalledWith(expect.stringContaining('/orders'));
			expect(result).toEqual(mockOrders);
		});
	});

	describe('getOrderById', () => {
		it('should fetch order by id', async () => {
			const mockOrder: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'PAID',
				totalAmount: 200,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockOrder);

			const result = await orderService.getOrderById('1');

			expect(RestServices.get).toHaveBeenCalledWith(expect.stringContaining('/orders'));
			expect(result).toEqual(mockOrder);
		});
	});

	describe('createOrder', () => {
		it('should create a new order', async () => {
			const orderData: CreateOrderInput = {
				items: [{ productId: 'product-1', quantity: 2, price: 50 }],
				totalAmount: 100
			};
			const mockResponse: OrderOutput = {
				id: '2',
				buyerId: 'user-1',
				status: 'PENDING',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.createOrder(orderData);

			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), orderData);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateOrderStatus', () => {
		it('should update order status', async () => {
			const mockResponse: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'SHIPPED',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.patch as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.updateOrderStatus('1', 'SHIPPED');

			expect(RestServices.patch).toHaveBeenCalledWith(expect.stringContaining('/orders'), {
				status: 'SHIPPED'
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('markAsPaid', () => {
		it('should mark order as paid', async () => {
			const mockResponse: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'PAID',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.markAsPaid('1');

			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), {});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('markAsShipped', () => {
		it('should mark order as shipped', async () => {
			const mockResponse: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'SHIPPED',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.markAsShipped('1');

			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), {});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('markAsDelivered', () => {
		it('should mark order as delivered', async () => {
			const mockResponse: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'DELIVERED',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.markAsDelivered('1');

			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), {});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('cancelOrder', () => {
		it('should cancel order', async () => {
			const mockResponse: OrderOutput = {
				id: '1',
				buyerId: 'user-1',
				status: 'CANCELLED',
				totalAmount: 100,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				items: []
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await orderService.cancelOrder('1');

			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), {});
			expect(result).toEqual(mockResponse);
		});
	});
});
