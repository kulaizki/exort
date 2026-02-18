import type { PageServerLoad } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;

	const [gamesRes, metricsRes] = await Promise.all([
		api('/games?limit=5&sort=date&order=desc', token),
		api('/metrics/summary', token)
	]);

	return {
		recentGames: gamesRes.data?.data ?? [],
		totalGames: gamesRes.data?.total ?? 0,
		metrics: metricsRes.data ?? null
	};
};
