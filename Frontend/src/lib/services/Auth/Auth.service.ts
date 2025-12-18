import RestServices from '$lib/services/RestServices';
import type { Login, Register, LoginSupabase, AuthPayload } from '$lib/models/Auth/AuthType';
import { supabase } from '$lib/lib/Supabase';
import config from '$lib/config/env';

const TOKEN_KEY = 'auth_token';
const SUPABASE_TOKEN_KEY = 'supabase_access_token';
const USER_KEY = 'auth_user';

export class AuthService {
	private static readonly baseUrl = `${config.backendUrl}/auth`;
	static async login(data: Login): Promise<AuthPayload> {
		const response: any = await RestServices.post<AuthPayload>(
			`${this.baseUrl}/login`,
			data
		);

		const payload = response?.data || response;
		if (payload.token) {
			this.setToken(payload.token, payload.supabaseAccessToken);
			this.setUser(payload.user);
		}

		return payload;
	}

	static async register(data: Register): Promise<AuthPayload> {
		const response: any = await RestServices.post<AuthPayload>(
			`${this.baseUrl}/register`,
			data
		);

		const payload = response?.data || response;

		if (payload.token) {
			this.setToken(payload.token, payload.supabaseAccessToken);
			this.setUser(payload.user);
		}

		return payload;
	}

	static async loginSupabase(data: LoginSupabase): Promise<AuthPayload> {
		const response: any = await RestServices.post<AuthPayload>(
			`${this.baseUrl}/login-supabase`,
			data
		);

		const payload = response?.data || response;

		if (payload.token) {
			this.setToken(payload.token, payload.supabaseAccessToken);
			this.setUser(payload.user);
		}

		return payload;
	}

	static async signInWithGoogle(): Promise<void> {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (error) {
				throw new Error(error.message);
			}
		} catch (err: any) {
			console.error('Google OAuth error:', err);
			throw new Error(err.message || 'Failed to sign in with Google');
		}
	}

	// Handle OAuth callback
	static async handleOAuthCallback(): Promise<AuthPayload | null> {
		try {
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const { data, error } = await supabase.auth.getSession();
			
			if (error || !data.session) {
				throw new Error(error?.message || 'No session found');
			}

			const { access_token } = data.session;

			const payload = await this.loginSupabase({ supabaseAccessToken: access_token });

			return payload;
		} catch (err: any) {
			console.error('OAuth callback error:', err);
			throw new Error(err.message || 'Failed to process OAuth callback');
		}
	}

	static setToken(token: string, supabaseToken?: string): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem(TOKEN_KEY, token);
			if (supabaseToken) {
				localStorage.setItem(SUPABASE_TOKEN_KEY, supabaseToken);
			}
		}
	}

	static getToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(TOKEN_KEY);
		}
		return null;
	}

	static getSupabaseToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(SUPABASE_TOKEN_KEY);
		}
		return null;
	}

	static removeToken(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(SUPABASE_TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
		}
	}

	static isAuthenticated(): boolean {
		return this.getToken() !== null;
	}

	static setUser(user: any): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem(USER_KEY, JSON.stringify(user));
		}
	}

	static getUser(): any | null {
		if (typeof window !== 'undefined') {
			const userStr = localStorage.getItem(USER_KEY);
			if (userStr) {
				try {
					return JSON.parse(userStr);
				} catch (e) {
					return null;
				}
			}
		}
		return null;
	}

	static logout(): void {
		this.removeToken();
	}
}

export default AuthService;