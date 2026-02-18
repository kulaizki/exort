import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://localhost:3001';

export async function api(path: string, token: string, options?: RequestInit) {
	try {
		const res = await fetch(`${API_URL}${path}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				...options?.headers
			}
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			return { error: body.error || res.statusText, status: res.status, data: null };
		}

		const data = await res.json();
		return { error: null, status: res.status, data };
	} catch {
		return { error: 'API unavailable', status: 503, data: null };
	}
}
