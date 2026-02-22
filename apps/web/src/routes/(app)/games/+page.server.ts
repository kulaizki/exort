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

	const [res, activeRes] = await Promise.all([
		api(`/games?${params.toString()}`, token),
		api('/analysis/active', token)
	]);

	return {
		games: res.data?.data ?? [],
		total: res.data?.total ?? 0,
		page: res.data?.page ?? 1,
		totalPages: res.data?.totalPages ?? 1,
		activeJobs: activeRes.data ?? { total: 0, processing: 0, pending: 0 },
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
		const gameId = formData.get('gameId') as string;

		if (!gameId) {
			return fail(400, { analyzeError: 'No game selected' });
		}

		const res = await api('/analysis/enqueue', token, {
			method: 'POST',
			body: JSON.stringify({ gameId })
		});

		if (res.error) {
			return fail(400, { analyzeError: res.error });
		}

		return { analyzed: true, count: 1 };
	}
};
