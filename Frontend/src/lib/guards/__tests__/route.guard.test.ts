// Mock authState
const mockAuthState = {
	user: null as any,
	isLoading: false,
	isAuthenticated: false,
	isModerator: jest.fn(),
	isSeller: jest.fn()
};

jest.mock('$lib/stores/auth.svelte', () => ({
	authState: mockAuthState
}));

jest.mock('$app/navigation');

import { goto } from '$app/navigation';
import AuthService from '$lib/services/Auth/Auth.service';
import { requireAuth, requireModerator, requireRole, requireSeller } from '../route.guard';

describe('Route Guards', () => {
	let isAuthenticatedSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		mockAuthState.isLoading = false;
		mockAuthState.user = null;
		mockAuthState.isAuthenticated = false;

		// Spy on AuthService.isAuthenticated
		isAuthenticatedSpy = jest.spyOn(AuthService, 'isAuthenticated');
	});

	afterEach(() => {
		isAuthenticatedSpy.mockRestore();
	});

	describe('requireAuth', () => {
		it('should return true when user is authenticated', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireAuth();

			expect(result).toBe(true);
			expect(goto).not.toHaveBeenCalled();
		});

		it('should redirect to /auth when user is not authenticated', async () => {
			mockAuthState.user = null;
			mockAuthState.isAuthenticated = false;
			isAuthenticatedSpy.mockReturnValue(false);

			const result = await requireAuth();

			expect(result).toBe(false);
			expect(goto).toHaveBeenCalledWith('/auth');
		});

		it('should wait for loading to complete', async () => {
			mockAuthState.isLoading = true;
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			isAuthenticatedSpy.mockReturnValue(true);

			setTimeout(() => {
				mockAuthState.isLoading = false;
			}, 50);

			const result = await requireAuth();

			expect(result).toBe(true);
		});
	});

	describe('requireRole', () => {
		it('should return true when user has MODERATOR role', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: true,
				isSeller: false,
				isBanned: false,
				roles: ['MODERATOR']
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isModerator.mockReturnValue(true);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireRole('MODERATOR');

			expect(result).toBe(true);
			expect(goto).not.toHaveBeenCalled();
		});

		it('should return true when user has SELLER role', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: true,
				isBanned: false,
				roles: ['SELLER']
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isSeller.mockReturnValue(true);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireRole('SELLER');

			expect(result).toBe(true);
		});

		it('should redirect to /unauthorized when user lacks MODERATOR role', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isModerator.mockReturnValue(false);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireRole('MODERATOR');

			expect(result).toBe(false);
			expect(goto).toHaveBeenCalledWith('/unauthorized');
		});

		it('should redirect to /unauthorized when user lacks SELLER role', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isSeller.mockReturnValue(false);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireRole('SELLER');

			expect(result).toBe(false);
			expect(goto).toHaveBeenCalledWith('/unauthorized');
		});

		it('should redirect to /auth when user is not authenticated', async () => {
			mockAuthState.user = null;
			mockAuthState.isAuthenticated = false;
			isAuthenticatedSpy.mockReturnValue(false);

			const result = await requireRole('MODERATOR');

			expect(result).toBe(false);
			expect(goto).toHaveBeenCalledWith('/auth');
		});
	});

	describe('requireSeller', () => {
		it('should call requireRole with SELLER', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: true,
				isBanned: false,
				roles: ['SELLER']
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isSeller.mockReturnValue(true);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireSeller();

			expect(result).toBe(true);
		});

		it('should return false when user is not seller', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isSeller.mockReturnValue(false);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireSeller();

			expect(result).toBe(false);
		});
	});

	describe('requireModerator', () => {
		it('should call requireRole with MODERATOR', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: true,
				isSeller: false,
				isBanned: false,
				roles: ['MODERATOR']
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isModerator.mockReturnValue(true);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireModerator();

			expect(result).toBe(true);
		});

		it('should return false when user is not moderator', async () => {
			mockAuthState.user = {
				id: '1',
				name: 'Test',
				email: 'test@test.com',
				isModerator: false,
				isSeller: false,
				isBanned: false,
				roles: []
			};
			mockAuthState.isAuthenticated = true;
			mockAuthState.isModerator.mockReturnValue(false);
			isAuthenticatedSpy.mockReturnValue(true);

			const result = await requireModerator();

			expect(result).toBe(false);
		});
	});
});
