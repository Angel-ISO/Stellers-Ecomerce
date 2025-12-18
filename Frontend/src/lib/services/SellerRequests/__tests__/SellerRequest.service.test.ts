import type {
	CreateSellerRequestInput,
	SellerRequest
} from '$lib/models/SellerRequests/SellerRequestType';
import RestServices from '$lib/services/RestServices';
import sellerRequestService from '../SellerRequest.service';

jest.mock('$lib/services/RestServices');

describe('SellerRequestService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createRequest', () => {
		it('should create a seller request', async () => {
			const input: CreateSellerRequestInput = {
				businessName: 'My Store',
				businessDescription: 'A great store',
				contactEmail: 'contact@mystore.com'
			};
			const mockResponse: SellerRequest = {
				id: '1',
				userId: 'user-1',
				status: 'PENDING',
				...input,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await sellerRequestService.createRequest(input);

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/seller-requests',
				input
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getPendingRequests', () => {
		it('should fetch all pending requests', async () => {
			const mockRequests: SellerRequest[] = [
				{
					id: '1',
					userId: 'user-1',
					status: 'PENDING',
					businessName: 'Store 1',
					businessDescription: 'Description 1',
					contactEmail: 'store1@test.com',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			];
			(RestServices.get as jest.Mock).mockResolvedValue(mockRequests);

			const result = await sellerRequestService.getPendingRequests();

			expect(RestServices.get).toHaveBeenCalledWith(
				'http://localhost:3000/seller-requests/pending'
			);
			expect(result).toEqual(mockRequests);
		});
	});

	describe('getMyRequest', () => {
		it('should fetch current user request', async () => {
			const mockRequest: SellerRequest = {
				id: '1',
				userId: 'user-1',
				status: 'PENDING',
				businessName: 'My Store',
				businessDescription: 'Description',
				contactEmail: 'me@test.com',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockRequest);

			const result = await sellerRequestService.getMyRequest();

			expect(RestServices.get).toHaveBeenCalledWith(
				'http://localhost:3000/seller-requests/my-request'
			);
			expect(result).toEqual(mockRequest);
		});

		it('should return null if no request exists', async () => {
			(RestServices.get as jest.Mock).mockResolvedValue(null);

			const result = await sellerRequestService.getMyRequest();

			expect(result).toBeNull();
		});
	});

	describe('approveRequest', () => {
		it('should approve a seller request', async () => {
			(RestServices.post as jest.Mock).mockResolvedValue(undefined);

			await sellerRequestService.approveRequest('1');

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/seller-requests/1/approve',
				{}
			);
		});
	});

	describe('rejectRequest', () => {
		it('should reject a seller request', async () => {
			(RestServices.post as jest.Mock).mockResolvedValue(undefined);

			await sellerRequestService.rejectRequest('1');

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/seller-requests/1/reject',
				{}
			);
		});
	});
});
