import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { genericOAuth } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { prisma } from '$lib/server/prisma';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	emailAndPassword: { enabled: true },
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'lichess',
					clientId: env.LICHESS_CLIENT_ID || 'exort',
					clientSecret: env.LICHESS_CLIENT_SECRET || '',
					authorizationUrl: 'https://lichess.org/oauth',
					tokenUrl: 'https://lichess.org/api/token',
					scopes: ['email:read'],
					pkce: true,
					getUserInfo: async (tokens) => {
						const headers = {
							Authorization: `Bearer ${tokens.accessToken}`,
							Accept: 'application/json'
						};
						const [accountRes, emailRes] = await Promise.all([
							fetch('https://lichess.org/api/account', { headers }),
							fetch('https://lichess.org/api/account/email', { headers })
						]);
						const account = await accountRes.json();
						const emailData = emailRes.ok ? await emailRes.json() : null;
						return {
							id: account.id,
							name: account.username,
							email: emailData?.email ?? undefined,
							emailVerified: !!emailData?.email
						};
					}
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // must be the last plugin
	]
});
