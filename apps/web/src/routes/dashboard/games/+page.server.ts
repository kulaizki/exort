import type { PageServerLoad } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const url = event.url;

	const params = new URLSearchParams();
	params.set('page', url.searchParams.get('page') || '1');
	params.set('limit', url.searchParams.get('limit') || '20');
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
