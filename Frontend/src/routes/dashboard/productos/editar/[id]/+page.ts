import { page } from '$app/stores';
import { get } from 'svelte/store';
import { requireProductOwnership } from '$lib/guards/ownership.guard';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const canAccess = await requireProductOwnership(params.id);
	if (!canAccess) {
		throw redirect(302, '/unauthorized');
	}
};

