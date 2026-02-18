<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';

	let { data, form } = $props();
	const profile = $derived(data.profile);
	const lichess = $derived(profile.lichessAccount);
</script>

<svelte:head>
	<title>settings — exort</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-lg font-semibold text-neutral-200">Settings</h1>
		<p class="mt-1 text-sm text-neutral-500">Manage your account and connections</p>
	</div>

	{#if form?.message}
		<div class="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
			{form.message}
		</div>
	{/if}

	{#if form?.success}
		<div class="rounded-sm border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
			Updated successfully.
		</div>
	{/if}

	<!-- Profile -->
	<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
		<h2 class="mb-4 text-sm font-medium text-neutral-300">Profile</h2>
		<form method="post" action="?/updateProfile" use:enhance class="space-y-4">
			<div>
				<label for="name" class="mb-1.5 block text-xs font-medium text-neutral-400">Name</label>
				<input
					id="name"
					type="text"
					name="name"
					value={profile.user?.name ?? ''}
					class="w-full max-w-sm rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-gold focus:outline-none"
				/>
			</div>
			<div>
				<label for="email" class="mb-1.5 block text-xs font-medium text-neutral-400">Email</label>
				<input
					id="email"
					type="email"
					name="email"
					value={profile.user?.email ?? ''}
					class="w-full max-w-sm rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-gold focus:outline-none"
				/>
			</div>
			<button type="submit" class="cursor-pointer rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light">
				Save Changes
			</button>
		</form>
	</div>

	<!-- Lichess connection -->
	<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
		<h2 class="mb-4 text-sm font-medium text-neutral-300">Lichess Account</h2>

		{#if lichess}
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-800">
						<svg class="h-5 w-5 text-neutral-200" viewBox="0 0 50 50" fill="currentColor">
							<path stroke="currentColor" stroke-linejoin="round" d="M38.956.5c-3.53.418-6.452.902-9.286 2.984C5.534 1.786-.692 18.533.68 29.364 3.493 50.214 31.918 55.785 41.329 41.7c-7.444 7.696-19.276 8.752-28.323 3.084C3.959 39.116-.506 27.392 4.683 17.567 9.873 7.742 18.996 4.535 29.03 6.405c2.43-1.418 5.225-3.22 7.655-3.187l-1.694 4.86 12.752 21.37c-.439 5.654-5.459 6.112-5.459 6.112-.574-1.47-1.634-2.942-4.842-6.036-3.207-3.094-17.465-10.177-15.788-16.207-2.001 6.967 10.311 14.152 14.04 17.663 3.73 3.51 5.426 6.04 5.795 6.756 0 0 9.392-2.504 7.838-8.927L37.4 7.171z"/>
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium text-neutral-200">{lichess.lichessUsername}</p>
						<p class="text-xs text-neutral-500">
							{#if lichess.lastSyncedAt}
								Last synced {new Date(lichess.lastSyncedAt).toLocaleDateString()}
							{:else}
								Never synced
							{/if}
						</p>
					</div>
				</div>
				<form method="post" action="?/disconnectLichess" use:enhance>
					<button type="submit" class="cursor-pointer rounded-sm border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10">
						Disconnect
					</button>
				</form>
			</div>
		{:else}
			<p class="mb-3 text-sm text-neutral-400">Connect your Lichess account to sync games and get coaching insights.</p>
			<button
				onclick={() => authClient.signIn.oauth2({ providerId: 'lichess', callbackURL: '/settings' })}
				class="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
			>
				<svg class="h-4 w-4" viewBox="0 0 50 50" fill="currentColor">
					<path stroke="currentColor" stroke-linejoin="round" d="M38.956.5c-3.53.418-6.452.902-9.286 2.984C5.534 1.786-.692 18.533.68 29.364 3.493 50.214 31.918 55.785 41.329 41.7c-7.444 7.696-19.276 8.752-28.323 3.084C3.959 39.116-.506 27.392 4.683 17.567 9.873 7.742 18.996 4.535 29.03 6.405c2.43-1.418 5.225-3.22 7.655-3.187l-1.694 4.86 12.752 21.37c-.439 5.654-5.459 6.112-5.459 6.112-.574-1.47-1.634-2.942-4.842-6.036-3.207-3.094-17.465-10.177-15.788-16.207-2.001 6.967 10.311 14.152 14.04 17.663 3.73 3.51 5.426 6.04 5.795 6.756 0 0 9.392-2.504 7.838-8.927L37.4 7.171z"/>
				</svg>
				Connect Lichess
			</button>
		{/if}
	</div>

	<!-- Account -->
	<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
		<h2 class="mb-4 text-sm font-medium text-neutral-300">Account</h2>
		<div class="flex flex-wrap gap-3">
			<a href="/settings" class="rounded-sm border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800">
				Change Password
			</a>
			<button class="cursor-pointer rounded-sm border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
				Delete Account
			</button>
		</div>
	</div>
</div>
