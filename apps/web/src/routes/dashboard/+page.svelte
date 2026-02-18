<script lang="ts">
	import { StatCard, EmptyState } from '$lib/features/dashboard';

	let { data } = $props();

	const stats = $derived([
		{
			label: 'Total Games',
			value: data.totalGames,
			subtext: 'synced from Lichess'
		},
		{
			label: 'Avg Accuracy',
			value: data.metrics?.avgAccuracy ? `${data.metrics.avgAccuracy.toFixed(1)}%` : '--',
			subtext: 'across all games'
		},
		{
			label: 'Blunder Rate',
			value: data.metrics?.avgBlunders ? data.metrics.avgBlunders.toFixed(1) : '--',
			subtext: 'per game'
		},
		{
			label: 'This Week',
			value: data.metrics?.gamesThisWeek ?? 0,
			subtext: 'games played'
		}
	]);
</script>

<svelte:head>
	<title>dashboard — exort</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-lg font-semibold text-neutral-200">Dashboard</h1>
		<p class="mt-1 text-sm text-neutral-500">Your chess improvement overview</p>
	</div>

	<!-- Stat cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		{#each stats as stat}
			<StatCard label={stat.label} value={stat.value} subtext={stat.subtext} />
		{/each}
	</div>

	<!-- Recent games -->
	<div>
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-sm font-medium text-neutral-300">Recent Games</h2>
			{#if data.totalGames > 0}
				<a href="/dashboard/games" class="text-xs text-gold transition-colors hover:text-gold-light">View all</a>
			{/if}
		</div>

		{#if data.recentGames.length > 0}
			<div class="divide-y divide-neutral-800 rounded-sm border border-neutral-800 bg-neutral-900">
				{#each data.recentGames as game}
					<a href="/dashboard/games/{game.id}" class="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-800/50">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="inline-flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold
									{game.result === 'win' ? 'bg-green-500/20 text-green-400' : game.result === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-700 text-neutral-400'}">
									{game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
								</span>
								<span class="truncate text-sm text-neutral-200">vs {game.opponent}</span>
							</div>
							<p class="mt-0.5 text-xs text-neutral-500">
								{game.timeControl} &middot; {game.metrics?.openingName ?? 'Unknown opening'}
							</p>
						</div>
						<div class="ml-4 text-right">
							{#if game.metrics?.accuracy != null}
								<p class="text-sm font-medium text-neutral-200">{game.metrics.accuracy.toFixed(1)}%</p>
								<p class="text-xs text-neutral-500">accuracy</p>
							{:else}
								<p class="text-xs text-neutral-500">not analyzed</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<EmptyState
				title="No games yet"
				description="Connect your Lichess account and sync your games to get started."
				actionLabel="Go to Settings"
				actionHref="/dashboard/settings"
			/>
		{/if}
	</div>

	<!-- Quick actions -->
	<div class="flex flex-wrap gap-3">
		<a href="/dashboard/coach" class="inline-flex items-center gap-2 rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
			Ask Coach
		</a>
		<a href="/dashboard/insights" class="inline-flex items-center gap-2 rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
			View Insights
		</a>
	</div>
</div>
