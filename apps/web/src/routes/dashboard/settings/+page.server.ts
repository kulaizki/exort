import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/server/api';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const res = await api('/profile', token);

	return {
		profile: res.data ?? { user: event.locals.user, lichessAccount: null }
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const token = event.locals.session!.token;
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();

		const res = await api('/profile', token, {
			method: 'PATCH',
			body: JSON.stringify({ name, email })
		});

		if (res.error) {
			return fail(400, { message: res.error });
		}

		return { success: true };
	},

	disconnectLichess: async (event) => {
		const token = event.locals.session!.token;
		const res = await api('/lichess/disconnect', token, { method: 'DELETE' });

		if (res.error) {
			return fail(400, { message: res.error });
		}

		return { success: true };
	}
};
