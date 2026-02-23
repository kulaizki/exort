import type { PageServerLoad, Actions } from './$types';
import { api } from '$lib/server/api';

export const load: PageServerLoad = async (event) => {
	const token = event.locals.session!.token;
	const res = await api('/chat/sessions', token);

	return {
		sessions: res.data ?? []
	};
};

export const actions: Actions = {
	createSession: async (event) => {
		const token = event.locals.session!.token;
		const data = await event.request.formData();
		const title = data.get('title') as string | null;

		const res = await api('/chat/sessions', token, {
			method: 'POST',
			body: JSON.stringify({ title: title || 'New conversation' })
		});

		return { session: res.data };
	},

	loadMessages: async (event) => {
		const token = event.locals.session!.token;
		const data = await event.request.formData();
		const sessionId = data.get('sessionId') as string;

		const res = await api(`/chat/sessions/${sessionId}/messages`, token);

		return { messages: res.data ?? [] };
	},

	deleteSession: async (event) => {
		const token = event.locals.session!.token;
		const data = await event.request.formData();
		const sessionId = data.get('sessionId') as string;

		await api(`/chat/sessions/${sessionId}`, token, { method: 'DELETE' });

		return { deleted: sessionId };
	},

	sendMessage: async (event) => {
		const token = event.locals.session!.token;
		const data = await event.request.formData();
		const sessionId = data.get('sessionId') as string;
		const content = data.get('content') as string;

		const res = await api(`/chat/sessions/${sessionId}/messages`, token, {
			method: 'POST',
			body: JSON.stringify({ content })
		});

		return { assistantMessage: res.data?.assistantMessage ?? null };
	}
};
