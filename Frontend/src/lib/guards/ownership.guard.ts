import { goto } from '$app/navigation';
import { authState } from '$lib/stores/auth.svelte';
import { requireSeller } from './route.guard';

export async function requireProductOwnership(productId: string): Promise<boolean> {
	const isSeller = await requireSeller();
	if (!isSeller) return false;

	const canEdit = await authState.canEditProduct(productId);
	if (!canEdit) {
		goto('/unauthorized');
		return false;
	}

	return true;
}

