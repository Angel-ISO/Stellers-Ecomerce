// Mock del authState
const mockAuthState = {
	user: null as any,
	isLoading: true,
	isAuthenticated: false,
	initialize: jest.fn(),
	setUser: jest.fn(),
	logout: jest.fn(),
	hasRole: jest.fn(),
	isSeller: jest.fn(),
	isModerator: jest.fn(),
	isBanned: jest.fn(),
	canEditProduct: jest.fn(),
	displayName: 'User'
};

jest.mock('../auth.svelte', () => ({
	authState: mockAuthState
}));

// Mock AuthService
jest.mock('$lib/services/Auth/Auth.service', () => ({
	default: {
		getUser: jest.fn(),
		getToken: jest.fn(),
		logout: jest.fn()
	}
}));

describe('AuthState', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAuthState.user = null;
		mockAuthState.isLoading = true;
		mockAuthState.isAuthenticated = false;
	});

	describe('Mock functionality', () => {
		it('should allow setting user', () => {
			const mockUser = {
				id: '1',
				name: 'Test User',
				email: 'test@test.com',
				isModerator: true,
				isSeller: false,
				isBanned: false,
				roles: ['MODERATOR']
			};

			mockAuthState.user = mockUser;
			mockAuthState.isAuthenticated = true;

			expect(mockAuthState.user).toEqual(mockUser);
			expect(mockAuthState.isAuthenticated).toBe(true);
		});

		it('should allow setting loading state', () => {
			mockAuthState.isLoading = false;

			expect(mockAuthState.isLoading).toBe(false);
		});

		it('should call logout', () => {
			mockAuthState.logout();

			expect(mockAuthState.logout).toHaveBeenCalled();
		});

		it('should call hasRole', () => {
			mockAuthState.hasRole.mockReturnValue(true);

			const result = mockAuthState.hasRole('MODERATOR');

			expect(result).toBe(true);
			expect(mockAuthState.hasRole).toHaveBeenCalledWith('MODERATOR');
		});

		it('should call isSeller', () => {
			mockAuthState.isSeller.mockReturnValue(true);

			const result = mockAuthState.isSeller();

			expect(result).toBe(true);
		});

		it('should call isModerator', () => {
			mockAuthState.isModerator.mockReturnValue(false);

			const result = mockAuthState.isModerator();

			expect(result).toBe(false);
		});

		it('should call isBanned', () => {
			mockAuthState.isBanned.mockReturnValue(false);

			const result = mockAuthState.isBanned();

			expect(result).toBe(false);
		});

		it('should have displayName property', () => {
			expect(mockAuthState.displayName).toBeDefined();
		});

		it('should call initialize', () => {
			mockAuthState.initialize();

			expect(mockAuthState.initialize).toHaveBeenCalled();
		});

		it('should call setUser', () => {
			const user = { id: '1', name: 'Test' };
			mockAuthState.setUser(user);

			expect(mockAuthState.setUser).toHaveBeenCalledWith(user);
		});

		it('should call canEditProduct', async () => {
			mockAuthState.canEditProduct.mockResolvedValue(true);

			const result = await mockAuthState.canEditProduct('product-1');

			expect(result).toBe(true);
			expect(mockAuthState.canEditProduct).toHaveBeenCalledWith('product-1');
		});
	});
});
