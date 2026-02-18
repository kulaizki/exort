import type { PageServerLoad } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;

	const [summaryRes, trendsRes] = await Promise.all([
		api('/metrics/summary', token),
		api('/metrics/trends', token)
	]);

	return {
		summary: summaryRes.data ?? null,
		trends: trendsRes.data ?? null
	};
};
