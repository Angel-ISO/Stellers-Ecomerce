import { requireModerator } from '$lib/guards/route.guard';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	const canAccess = await requireModerator();
	if (!canAccess) {
		throw redirect(302, '/unauthorized');
	}
};

