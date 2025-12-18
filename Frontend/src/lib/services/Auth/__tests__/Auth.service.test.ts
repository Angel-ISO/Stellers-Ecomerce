import RestServices from '$lib/services/RestServices';
import AuthService from '../Auth.service';

jest.mock('$lib/services/RestServices');
jest.mock('$lib/lib/Supabase', () => ({
	supabase: {
		auth: {
			signInWithOAuth: jest.fn(),
			getSession: jest.fn()
		}
	}
}));

describe('AuthService', () => {
	let localStorageSpy: {
		getItem: jest.SpyInstance;
		setItem: jest.SpyInstance;
		removeItem: jest.SpyInstance;
		clear: jest.SpyInstance;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();

		// Create spies on localStorage methods
		localStorageSpy = {
			getItem: jest.spyOn(Storage.prototype, 'getItem'),
			setItem: jest.spyOn(Storage.prototype, 'setItem'),
			removeItem: jest.spyOn(Storage.prototype, 'removeItem'),
			clear: jest.spyOn(Storage.prototype, 'clear')
		};
	});

	afterEach(() => {
		// Restore spies
		localStorageSpy.getItem.mockRestore();
		localStorageSpy.setItem.mockRestore();
		localStorageSpy.removeItem.mockRestore();
		localStorageSpy.clear.mockRestore();
	});

	describe('setToken', () => {
		it('should store token in localStorage', () => {
			AuthService.setToken('test-token');

			expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
		});

		it('should store both tokens when supabase token provided', () => {
			AuthService.setToken('test-token', 'supabase-token');

			expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
			expect(localStorage.setItem).toHaveBeenCalledWith('supabase_access_token', 'supabase-token');
		});
	});

	describe('getToken', () => {
		it('should retrieve token from localStorage', () => {
			localStorage.setItem('auth_token', 'stored-token');

			const token = AuthService.getToken();

			expect(token).toBe('stored-token');
		});

		it('should return null when no token exists', () => {
			const token = AuthService.getToken();

			expect(token).toBeNull();
		});
	});

	describe('getSupabaseToken', () => {
		it('should retrieve supabase token from localStorage', () => {
			localStorage.setItem('supabase_access_token', 'supabase-token');

			const token = AuthService.getSupabaseToken();

			expect(token).toBe('supabase-token');
		});

		it('should return null when no supabase token exists', () => {
			const token = AuthService.getSupabaseToken();

			expect(token).toBeNull();
		});
	});

	describe('removeToken', () => {
		it('should remove all auth tokens from localStorage', () => {
			localStorage.setItem('auth_token', 'token');
			localStorage.setItem('supabase_access_token', 'supabase');
			localStorage.setItem('auth_user', '{}');

			AuthService.removeToken();

			expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
			expect(localStorage.removeItem).toHaveBeenCalledWith('supabase_access_token');
			expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
		});
	});

	describe('isAuthenticated', () => {
		it('should return true when token exists', () => {
			localStorage.setItem('auth_token', 'token');

			expect(AuthService.isAuthenticated()).toBe(true);
		});

		it('should return false when no token exists', () => {
			expect(AuthService.isAuthenticated()).toBe(false);
		});
	});

	describe('setUser', () => {
		it('should store user in localStorage', () => {
			const user = { id: '1', name: 'Test User', email: 'test@test.com' };

			AuthService.setUser(user);

			expect(localStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(user));
		});
	});

	describe('getUser', () => {
		it('should retrieve user from localStorage', () => {
			const user = { id: '1', name: 'Test User', email: 'test@test.com' };
			localStorage.setItem('auth_user', JSON.stringify(user));

			const retrievedUser = AuthService.getUser();

			expect(retrievedUser).toEqual(user);
		});

		it('should return null when no user exists', () => {
			const user = AuthService.getUser();

			expect(user).toBeNull();
		});

		it('should return null when user data is invalid JSON', () => {
			localStorage.setItem('auth_user', 'invalid-json');

			const user = AuthService.getUser();

			expect(user).toBeNull();
		});
	});

	describe('logout', () => {
		it('should call removeToken', () => {
			const removeTokenSpy = jest.spyOn(AuthService, 'removeToken');

			AuthService.logout();

			expect(removeTokenSpy).toHaveBeenCalled();
		});

		it('should clear all auth data', () => {
			localStorage.setItem('auth_token', 'token');
			localStorage.setItem('auth_user', '{}');

			AuthService.logout();

			expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
			expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
		});
	});

	describe('login', () => {
		it('should call RestServices with correct parameters', async () => {
			const loginData = { email: 'test@test.com', password: 'password' };
			const mockResponse = {
				data: {
					token: 'auth-token',
					supabaseAccessToken: 'supabase-token',
					user: { id: '1', name: 'Test' }
				}
			};

			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			await AuthService.login(loginData);

			expect(RestServices.post).toHaveBeenCalledWith(
				expect.stringContaining('/auth/login'),
				loginData
			);
		});

		it('should store tokens and user on successful login', async () => {
			const mockResponse = {
				data: {
					token: 'auth-token',
					supabaseAccessToken: 'supabase-token',
					user: { id: '1', name: 'Test' }
				}
			};

			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			await AuthService.login({ email: 'test@test.com', password: 'password' });

			expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token');
			expect(localStorage.setItem).toHaveBeenCalledWith('supabase_access_token', 'supabase-token');
			expect(localStorage.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
		});
	});

	describe('register', () => {
		it('should call RestServices with correct parameters', async () => {
			const registerData = {
				email: 'test@test.com',
				password: 'password',
				name: 'Test User'
			};
			const mockResponse = {
				data: {
					token: 'auth-token',
					user: { id: '1', name: 'Test' }
				}
			};

			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			await AuthService.register(registerData as any);

			expect(RestServices.post).toHaveBeenCalledWith(
				expect.stringContaining('/auth/register'),
				registerData
			);
		});

		it('should store tokens and user on successful registration', async () => {
			const mockResponse = {
				data: {
					token: 'auth-token',
					supabaseAccessToken: 'supabase-token',
					user: { id: '1', name: 'Test' }
				}
			};

			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			await AuthService.register({
				email: 'test@test.com',
				password: 'password',
				name: 'Test User'
			} as any);

			expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token');
		});
	});

	describe('signInWithGoogle', () => {
		it('should throw when Supabase returns error', async () => {
			const { supabase } = jest.requireMock('$lib/lib/Supabase');
			(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
				error: { message: 'oauth failed' }
			});
			const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			await expect(AuthService.signInWithGoogle()).rejects.toThrow('oauth failed');
			errorSpy.mockRestore();
		});

		it('should succeed when Supabase returns no error', async () => {
			const { supabase } = jest.requireMock('$lib/lib/Supabase');
			(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ error: null });

			await expect(AuthService.signInWithGoogle()).resolves.toBeUndefined();
		});
	});

	describe('handleOAuthCallback', () => {
		it('should throw when session missing', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
			const { supabase } = jest.requireMock('$lib/lib/Supabase');
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: null
			});

			await expect(AuthService.handleOAuthCallback()).rejects.toThrow('No session found');
		});

		it('should throw when getSession returns error', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
			const { supabase } = jest.requireMock('$lib/lib/Supabase');
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: null },
				error: { message: 'bad' }
			});

			await expect(AuthService.handleOAuthCallback()).rejects.toThrow('bad');
		});

		it('should login with supabase token when session present', async () => {
			const { supabase } = jest.requireMock('$lib/lib/Supabase');
			(supabase.auth.getSession as jest.Mock).mockResolvedValue({
				data: { session: { access_token: 'abc' } },
				error: null
			});
			(RestServices.post as jest.Mock).mockResolvedValue({
				data: { token: 't', user: { id: '1' } }
			});

			const payload = await AuthService.handleOAuthCallback();
			expect(RestServices.post).toHaveBeenCalledWith(expect.stringContaining('/login-supabase'), {
				supabaseAccessToken: 'abc'
			});
			expect(payload).toEqual({ token: 't', user: { id: '1' } });
		});
	});
});
