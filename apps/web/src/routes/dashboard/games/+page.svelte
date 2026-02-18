<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { EmptyState } from '$lib/features/dashboard';

	let { data } = $props();

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
	</div>

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
				<div class="flex gap-2">
					{#if data.page > 1}
						<a
							href="?{new URLSearchParams({ ...Object.fromEntries(page.url.searchParams), page: String(data.page - 1) }).toString()}"
							class="rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-700"
						>Previous</a>
					{/if}
					{#if data.page < data.totalPages}
						<a
							href="?{new URLSearchParams({ ...Object.fromEntries(page.url.searchParams), page: String(data.page + 1) }).toString()}"
							class="rounded-sm border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-700"
						>Next</a>
					{/if}
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
