// Mock authState
const mockAuthState = {
	canEditProduct: jest.fn()
};

jest.mock('$lib/stores/auth.svelte', () => ({
	authState: mockAuthState
}));

jest.mock('$app/navigation');
jest.mock('../route.guard');

import { goto } from '$app/navigation';
import { requireProductOwnership } from '../ownership.guard';
import { requireSeller } from '../route.guard';

describe('Ownership Guard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('requireProductOwnership', () => {
		it('should return true when user is seller and owns product', async () => {
			(requireSeller as jest.Mock).mockResolvedValue(true);
			mockAuthState.canEditProduct.mockResolvedValue(true);

			const result = await requireProductOwnership('product-1');

			expect(result).toBe(true);
			expect(goto).not.toHaveBeenCalled();
		});

		it('should return false when user is not seller', async () => {
			(requireSeller as jest.Mock).mockResolvedValue(false);

			const result = await requireProductOwnership('product-1');

			expect(result).toBe(false);
		});

		it('should redirect to /unauthorized when user does not own product', async () => {
			(requireSeller as jest.Mock).mockResolvedValue(true);
			mockAuthState.canEditProduct.mockResolvedValue(false);

			const result = await requireProductOwnership('product-1');

			expect(result).toBe(false);
			expect(goto).toHaveBeenCalledWith('/unauthorized');
		});

		it('should check product ownership with correct productId', async () => {
			(requireSeller as jest.Mock).mockResolvedValue(true);
			mockAuthState.canEditProduct.mockResolvedValue(true);

			await requireProductOwnership('product-123');

			expect(mockAuthState.canEditProduct).toHaveBeenCalledWith('product-123');
		});
	});
});
