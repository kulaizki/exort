import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const res = await api(`/games/${event.params.id}`, token);

	if (res.error || !res.data) {
		return error(404, 'Game not found');
	}

	return { game: res.data };
};

export const actions: Actions = {
	analyze: async (event) => {
		const token = event.locals.session!.token;
		const res = await api('/analysis/enqueue', token, {
			method: 'POST',
			body: JSON.stringify({ gameId: event.params.id })
		});

		if (res.error) {
			return fail(400, { analyzeError: res.error });
		}

		return { analyzed: true };
	}
};
