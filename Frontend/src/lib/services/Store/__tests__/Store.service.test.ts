import type { Store } from '$lib/models/Store/StoreType';
import RestServices from '$lib/services/RestServices';
import storeService from '../Store.service';

jest.mock('$lib/services/RestServices');

describe('StoreService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getStore', () => {
		it('should fetch a store by id', async () => {
			const mockStore: Store = {
				id: '1',
				name: 'Test Store',
				description: 'Test Description',
				ownerId: 'user-1',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockStore);

			const result = await storeService.getStore('1');

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/stores/1');
			expect(result).toEqual(mockStore);
		});
	});
});
