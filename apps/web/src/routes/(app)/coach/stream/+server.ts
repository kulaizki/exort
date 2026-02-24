import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_URL = env.API_URL || 'http://localhost:3001';

export const POST: RequestHandler = async ({ request, locals }) => {
	const token = locals.session!.token;

	const { sessionId, content } = await request.json();

	const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages/stream`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ content })
	});

	if (!response.ok || !response.body) {
		throw error(502, 'Failed to connect to API');
	}

	return new Response(response.body, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
