import type { PageServerLoad } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const res = await api('/chat/sessions', token);

	return {
		sessions: res.data ?? [],
		token
	};
};
