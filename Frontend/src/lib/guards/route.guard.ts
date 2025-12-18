import { goto } from '$app/navigation';
import { authState } from '$lib/stores/auth.svelte';
import AuthService from '$lib/services/Auth/Auth.service';

export async function requireAuth(): Promise<boolean> {
	if (authState.isLoading) {
		await new Promise((resolve) => {
			const check = setInterval(() => {
				if (!authState.isLoading) {
					clearInterval(check);
					resolve(true);
				}
			}, 100);
		});
	}

	if (!authState.isAuthenticated || !AuthService.isAuthenticated()) {
		goto('/auth');
		return false;
	}

	return true;
}

export async function requireRole(role: 'MODERATOR' | 'SELLER'): Promise<boolean> {
	const authenticated = await requireAuth();
	if (!authenticated) return false;

	if (role === 'MODERATOR' && !authState.isModerator()) {
		goto('/unauthorized');
		return false;
	}

	if (role === 'SELLER' && !authState.isSeller()) {
		goto('/unauthorized');
		return false;
	}

	return true;
}

export async function requireSeller(): Promise<boolean> {
	return requireRole('SELLER');
}

export async function requireModerator(): Promise<boolean> {
	return requireRole('MODERATOR');
}

