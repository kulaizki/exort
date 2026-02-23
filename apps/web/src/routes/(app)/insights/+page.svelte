<script lang="ts">
	import { EmptyState } from '$lib/features/dashboard';
	import {
		AccuracyTrend,
		ErrorBreakdown,
		ResultDistribution,
		TimeControlPerf,
		RatingTrend
	} from '$lib/features/insights';

	let { data } = $props();
	const summary = $derived(data.summary);
	const trends = $derived(data.trends);
	const hasData = $derived(summary && (summary.analyzedGames ?? 0) > 0);
	const winRate = $derived(
		summary?.resultDistribution
			? Math.round(
					(summary.resultDistribution.wins /
						Math.max(summary.resultDistribution.wins + summary.resultDistribution.losses + summary.resultDistribution.draws, 1)) *
						100
				)
			: 0
	);
</script>

<svelte:head>
	<title>insights — exort</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
<div class="space-y-6">
	<div>
		<h1 class="text-lg font-semibold text-neutral-200">Insights</h1>
		<p class="mt-1 text-sm text-neutral-500">Understand your strengths and weaknesses</p>
	</div>

	{#if hasData}
		<!-- Stat cards -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
				<p class="text-xs font-medium text-neutral-500">Accuracy</p>
				<p class="mt-1 text-2xl font-bold text-gold">{summary.avgAccuracy?.toFixed(1) ?? '--'}%</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
				<p class="text-xs font-medium text-neutral-500">Centipawn Loss</p>
				<p class="mt-1 text-2xl font-bold text-neutral-200">{summary.avgCentipawnLoss?.toFixed(0) ?? '--'}</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
				<p class="text-xs font-medium text-neutral-500">Games Analyzed</p>
				<p class="mt-1 text-2xl font-bold text-neutral-200">{summary.analyzedGames ?? 0}</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
				<p class="text-xs font-medium text-neutral-500">Win Rate</p>
				<p class="mt-1 text-2xl font-bold text-neutral-200">{winRate}%</p>
			</div>
		</div>

		<!-- Error rates -->
		<div class="grid grid-cols-3 gap-3">
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-xl font-bold text-red-400">{summary.avgBlunders?.toFixed(1) ?? '--'}</p>
				<p class="mt-1 text-xs text-neutral-500">Blunders / game</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-xl font-bold text-orange-400">{summary.avgMistakes?.toFixed(1) ?? '--'}</p>
				<p class="mt-1 text-xs text-neutral-500">Mistakes / game</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-xl font-bold text-yellow-400">{summary.avgInaccuracies?.toFixed(1) ?? '--'}</p>
				<p class="mt-1 text-xs text-neutral-500">Inaccuracies / game</p>
			</div>
		</div>

		<!-- Charts grid: 2 columns on desktop -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Accuracy Trend -->
			{#if trends?.length > 0}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<h3 class="mb-3 text-sm font-medium text-neutral-300">Accuracy Trend</h3>
					<AccuracyTrend {trends} />
				</div>
			{/if}

			<!-- Error Breakdown -->
			{#if trends?.length > 0}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<h3 class="mb-3 text-sm font-medium text-neutral-300">Error Breakdown (last 20)</h3>
					<ErrorBreakdown {trends} />
				</div>
			{/if}

			<!-- Result Distribution -->
			{#if summary.resultDistribution}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<h3 class="mb-3 text-sm font-medium text-neutral-300">Results</h3>
					<ResultDistribution
						wins={summary.resultDistribution.wins}
						losses={summary.resultDistribution.losses}
						draws={summary.resultDistribution.draws}
					/>
				</div>
			{/if}

			<!-- Time Control Performance -->
			{#if summary.byTimeControl && Object.keys(summary.byTimeControl).length > 0}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<h3 class="mb-3 text-sm font-medium text-neutral-300">By Time Control</h3>
					<TimeControlPerf byTimeControl={summary.byTimeControl} />
				</div>
			{/if}
		</div>

		<!-- Rating over time (full width) -->
		{#if trends?.length > 0}
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
				<h3 class="mb-3 text-sm font-medium text-neutral-300">Rating Over Time</h3>
				<RatingTrend {trends} />
			</div>
		{/if}

		<!-- Top Openings (full width, CSS bars) -->
		{#if summary.topOpenings?.length > 0}
			<div>
				<h2 class="mb-3 text-sm font-medium text-neutral-300">Top Openings</h2>
				<div class="divide-y divide-neutral-800 rounded-sm border border-neutral-800 bg-neutral-900">
					{#each summary.topOpenings as opening (opening.eco ?? opening.name)}
						<div class="px-4 py-3">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm text-neutral-200">{opening.name}</p>
									<p class="text-xs text-neutral-500">
										{opening.eco ? `${opening.eco} · ` : ''}{opening.games} game{opening.games !== 1 ? 's' : ''}
									</p>
								</div>
								<p class="text-sm font-medium text-neutral-200">{opening.winRate}%</p>
							</div>
							<div class="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-neutral-800">
								<div
									class="h-full rounded-sm bg-gold"
									style="width: {opening.winRate}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<EmptyState
			title="No insights yet"
			description="Sync and analyze your Lichess games to unlock insights about your play."
			actionLabel="Go to Settings"
			actionHref="/settings"
		/>
	{/if}
</div>
</div>
