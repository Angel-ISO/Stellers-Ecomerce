import { requireAuth } from '$lib/guards/route.guard';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await requireAuth();
};

