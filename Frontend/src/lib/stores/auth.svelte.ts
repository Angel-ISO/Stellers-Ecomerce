import type { UserOutput } from '$lib/models/Auth/AuthType';
import AuthService from '$lib/services/Auth/Auth.service';

class AuthState {
	user = $state<UserOutput | null>(null);
	isAuthenticated = $derived(this.user !== null);
	isLoading = $state(true);


	initialize() {
		if (typeof window !== 'undefined') {
			const user = AuthService.getUser();
			const token = AuthService.getToken();

			if (user && token) {
				this.user = this.normalizeUser(user);
			}
		}
		this.isLoading = false;
	}

	setUser(user: UserOutput) {
		this.user = this.normalizeUser(user);
		this.isLoading = false;
	}

	logout() {
		this.user = null;
		AuthService.logout();
		this.isLoading = false;
	}

	private normalizeUser(user: UserOutput): UserOutput {
		const roles: string[] = [];
		if (user.isModerator) roles.push('MODERATOR');
		if (user.isSeller) roles.push('SELLER');
		
		return {
			...user,
			roles: user.roles || roles,
			isModerator: user.isModerator ?? false,
			isSeller: user.isSeller ?? false,
			isBanned: user.isBanned ?? false
		};
	}

	hasRole(role: string): boolean {
		return this.user?.roles?.includes(role) ?? false;
	}

	isSeller(): boolean {
		return this.user?.isSeller ?? false;
	}

	isModerator(): boolean {
		return this.user?.isModerator ?? false;
	}

	isBanned(): boolean {
		return this.user?.isBanned ?? false;
	}

	async canEditProduct(productId: string): Promise<boolean> {
		if (!this.user || !this.isSeller()) {
			return false;
		}

		try {
			const { StoreService } = await import('$lib/services/Store/Store.service');
			const { ProductService } = await import('$lib/services/Products/Product.service');
			
			const product: any = await ProductService.getProduct(productId);
			const productData = product?.data || product;
			
			if (!productData?.storeId) {
				return false;
			}

			const store: any = await StoreService.getStore(productData.storeId);
			const storeData = store?.data || store;
			
			return storeData?.ownerId === this.user.id;
		} catch (error) {
			console.error('Error checking product ownership:', error);
			return false;
		}
	}

	get displayName(): string {
		return this.user?.name || 'User';
	}
}

export const authState = new AuthState();
