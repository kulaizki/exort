import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const res = await api(`/games/${event.params.id}`, token);

	if (res.error || !res.data) {
		return error(404, 'Game not found');
	}

	return { game: res.data };
};
