import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/server/api';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const url = event.url;

	const params = new URLSearchParams();
	params.set('page', url.searchParams.get('page') || '1');
	params.set('limit', url.searchParams.get('limit') || '16');
	if (url.searchParams.get('timeControl')) params.set('timeControl', url.searchParams.get('timeControl')!);
	if (url.searchParams.get('result')) params.set('result', url.searchParams.get('result')!);
	if (url.searchParams.get('sort')) params.set('sort', url.searchParams.get('sort')!);
	if (url.searchParams.get('order')) params.set('order', url.searchParams.get('order')!);

	const res = await api(`/games?${params.toString()}`, token);

	return {
		games: res.data?.data ?? [],
		total: res.data?.total ?? 0,
		page: res.data?.page ?? 1,
		totalPages: res.data?.totalPages ?? 1,
		filters: {
			timeControl: url.searchParams.get('timeControl') || '',
			result: url.searchParams.get('result') || '',
			sort: url.searchParams.get('sort') || 'date',
			order: url.searchParams.get('order') || 'desc'
		}
	};
};

export const actions: Actions = {
	sync: async (event) => {
		const token = event.locals.session!.token;
		const res = await api('/sync/trigger', token, { method: 'POST' });

		if (res.error) {
			return fail(400, { syncError: res.error });
		}

		return { synced: true };
	},
	analyze: async (event) => {
		const token = event.locals.session!.token;
		const formData = await event.request.formData();
		const gameIds = formData.getAll('gameIds') as string[];

		if (gameIds.length === 0) {
			return fail(400, { analyzeError: 'No games selected' });
		}

		if (gameIds.length > 50) {
			return fail(400, { analyzeError: 'Maximum 50 games at a time' });
		}

		const res = await api('/analysis/batch-enqueue', token, {
			method: 'POST',
			body: JSON.stringify({ gameIds })
		});

		if (res.error) {
			return fail(400, { analyzeError: res.error });
		}

		return { analyzed: true, count: res.data?.count ?? 0 };
	}
};
