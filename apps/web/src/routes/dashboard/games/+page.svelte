<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { EmptyState } from '$lib/features/dashboard';

	let { data, form } = $props();
	let syncing = $state(false);

	function applyFilter(key: string, value: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.set('page', '1');
		goto(`?${params.toString()}`, { replaceState: true });
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function pageUrl(p: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(p));
		return `?${params.toString()}`;
	}

	function getPageNumbers(current: number, total: number): (number | '...')[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		const pages: (number | '...')[] = [1];

		if (current > 3) pages.push('...');

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);
		for (let i = start; i <= end; i++) pages.push(i);

		if (current < total - 2) pages.push('...');

		pages.push(total);
		return pages;
	}
</script>

<svelte:head>
	<title>games — exort</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-lg font-semibold text-neutral-200">Games</h1>
			<p class="mt-1 text-sm text-neutral-500">{data.total} games synced</p>
		</div>
		<form method="post" action="?/sync" use:enhance={() => {
			syncing = true;
			return async ({ update }) => {
				await update();
				syncing = false;
				await invalidateAll();
			};
		}}>
			<button
				type="submit"
				disabled={syncing}
				class="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
			>
				<svg class="h-3.5 w-3.5 {syncing ? 'animate-spin' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
				{syncing ? 'Syncing...' : 'Sync Games'}
			</button>
		</form>
	</div>

	{#if form?.synced}
		<div class="rounded-sm border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
			Games synced successfully.
		</div>
	{/if}

	{#if form?.syncError}
		<div class="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
			{form.syncError}
		</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap gap-2">
		<select
			value={data.filters.timeControl}
			onchange={(e) => applyFilter('timeControl', e.currentTarget.value)}
			class="cursor-pointer rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:border-gold focus:outline-none"
		>
			<option value="">All time controls</option>
			<option value="bullet">Bullet</option>
			<option value="blitz">Blitz</option>
			<option value="rapid">Rapid</option>
			<option value="classical">Classical</option>
		</select>

		<select
			value={data.filters.result}
			onchange={(e) => applyFilter('result', e.currentTarget.value)}
			class="cursor-pointer rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:border-gold focus:outline-none"
		>
			<option value="">All results</option>
			<option value="win">Wins</option>
			<option value="loss">Losses</option>
			<option value="draw">Draws</option>
		</select>

		<select
			value={data.filters.sort}
			onchange={(e) => applyFilter('sort', e.currentTarget.value)}
			class="cursor-pointer rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:border-gold focus:outline-none"
		>
			<option value="date">Sort by date</option>
			<option value="accuracy">Sort by accuracy</option>
			<option value="blunders">Sort by blunders</option>
		</select>
	</div>

	<!-- Games table -->
	{#if data.games.length > 0}
		<div class="overflow-x-auto rounded-sm border border-neutral-800">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-neutral-800 bg-neutral-900">
						<th class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Result</th>
						<th class="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Opponent</th>
						<th class="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 sm:table-cell">Time Control</th>
						<th class="hidden px-4 py-2.5 text-left text-xs font-medium text-neutral-500 md:table-cell">Opening</th>
						<th class="px-4 py-2.5 text-right text-xs font-medium text-neutral-500">Accuracy</th>
						<th class="hidden px-4 py-2.5 text-right text-xs font-medium text-neutral-500 sm:table-cell">Date</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-neutral-800">
					{#each data.games as game}
						<tr
							class="cursor-pointer bg-neutral-900/50 transition-colors hover:bg-neutral-800/50"
							onclick={() => goto(`/dashboard/games/${game.id}`)}
						>
							<td class="px-4 py-2.5">
								<span class="inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold
									{game.result === 'win' ? 'bg-green-500/20 text-green-400' : game.result === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-700 text-neutral-400'}">
									{game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
								</span>
							</td>
							<td class="px-4 py-2.5 text-neutral-200">{game.opponent}</td>
							<td class="hidden px-4 py-2.5 text-neutral-400 capitalize sm:table-cell">{game.timeControl}</td>
							<td class="hidden px-4 py-2.5 text-neutral-400 md:table-cell">{game.metrics?.openingName ?? '--'}</td>
							<td class="px-4 py-2.5 text-right font-medium {game.metrics?.accuracy != null ? 'text-neutral-200' : 'text-neutral-600'}">
								{game.metrics?.accuracy != null ? `${game.metrics.accuracy.toFixed(1)}%` : '--'}
							</td>
							<td class="hidden px-4 py-2.5 text-right text-neutral-500 sm:table-cell">{formatDate(game.playedAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-xs text-neutral-500">Page {data.page} of {data.totalPages}</p>
				<div class="flex items-center gap-1">
					<a
						href={data.page > 1 ? pageUrl(data.page - 1) : undefined}
						class="rounded-sm border border-neutral-700 px-2.5 py-1.5 text-xs transition-colors
							{data.page > 1 ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 cursor-pointer' : 'bg-neutral-800/50 text-neutral-600 pointer-events-none'}"
						aria-label="Previous page"
					>
						<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
					</a>

					{#each getPageNumbers(data.page, data.totalPages) as p}
						{#if p === '...'}
							<span class="px-1.5 text-xs text-neutral-600">...</span>
						{:else}
							<a
								href={pageUrl(p)}
								class="rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors
									{p === data.page ? 'bg-gold text-neutral-950' : 'border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700'}"
							>{p}</a>
						{/if}
					{/each}

					<a
						href={data.page < data.totalPages ? pageUrl(data.page + 1) : undefined}
						class="rounded-sm border border-neutral-700 px-2.5 py-1.5 text-xs transition-colors
							{data.page < data.totalPages ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 cursor-pointer' : 'bg-neutral-800/50 text-neutral-600 pointer-events-none'}"
						aria-label="Next page"
					>
						<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
					</a>
				</div>
			</div>
		{/if}
	{:else}
		<EmptyState
			title="No games found"
			description="Sync your Lichess games to see them here."
			actionLabel="Go to Settings"
			actionHref="/dashboard/settings"
		/>
	{/if}
</div>
