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
	const hasGames = $derived(summary && (summary.totalGames ?? 0) > 0);
	const hasAnalysis = $derived(summary && (summary.analyzedGames ?? 0) > 0);
	const analyzedTrends = $derived(
		trends?.filter((t: any) => t.accuracy != null) ?? []
	);
	const winRate = $derived(
		summary?.resultDistribution
			? Math.round(
					(summary.resultDistribution.wins /
						Math.max(
							summary.resultDistribution.wins +
								summary.resultDistribution.losses +
								summary.resultDistribution.draws,
							1
						)) *
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

		{#if hasGames}
			<!-- Stat cards -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#if hasAnalysis}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Accuracy</p>
						<p class="mt-1 text-2xl font-bold text-gold">
							{summary.avgAccuracy?.toFixed(1) ?? '--'}%
						</p>
					</div>
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Centipawn Loss</p>
						<p class="mt-1 text-2xl font-bold text-neutral-200">
							{summary.avgCentipawnLoss?.toFixed(0) ?? '--'}
						</p>
					</div>
				{:else}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Accuracy</p>
						<div class="mt-1 flex items-center gap-2 text-sm text-neutral-600">
							<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
							<span>Analyze games</span>
						</div>
					</div>
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Centipawn Loss</p>
						<div class="mt-1 flex items-center gap-2 text-sm text-neutral-600">
							<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
							<span>Analyze games</span>
						</div>
					</div>
				{/if}
				{#if hasAnalysis}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Games Analyzed</p>
						<p class="mt-1 text-2xl font-bold text-neutral-200">{summary.analyzedGames ?? 0}</p>
					</div>
				{:else}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
						<p class="text-xs font-medium text-neutral-500">Total Games</p>
						<p class="mt-1 text-2xl font-bold text-neutral-200">{summary.totalGames ?? 0}</p>
					</div>
				{/if}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
					<p class="text-xs font-medium text-neutral-500">Win Rate</p>
					<p class="mt-1 text-2xl font-bold text-neutral-200">{winRate}%</p>
				</div>
			</div>

			<!-- Error rates -->
			{#if hasAnalysis}
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
						<p class="text-xl font-bold text-yellow-400">
							{summary.avgInaccuracies?.toFixed(1) ?? '--'}
						</p>
						<p class="mt-1 text-xs text-neutral-500">Inaccuracies / game</p>
					</div>
				</div>
			{:else}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm text-neutral-500">Error Rates (Blunders, Mistakes, Inaccuracies)</p>
							<p class="mt-1 text-xs text-neutral-600">Analyze your games to unlock this insight</p>
						</div>
						<a href="/games" class="text-xs font-medium text-gold hover:underline">Go to Games</a>
					</div>
				</div>
			{/if}

			<!-- Charts grid: 2 columns on desktop -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Accuracy Trend -->
				{#if hasAnalysis && analyzedTrends.length > 0}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">Accuracy Trend</h3>
						<AccuracyTrend trends={analyzedTrends} />
					</div>
				{:else if !hasAnalysis}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">Accuracy Trend</h3>
						<div class="flex h-56 flex-col items-center justify-center gap-2">
							<p class="text-sm text-neutral-600">Analyze your games to unlock this insight</p>
							<a href="/games" class="text-xs font-medium text-gold hover:underline">Go to Games</a>
						</div>
					</div>
				{/if}

				<!-- Error Breakdown -->
				{#if hasAnalysis && analyzedTrends.length > 0}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">Error Breakdown (last 20)</h3>
						<ErrorBreakdown trends={analyzedTrends} />
					</div>
				{:else if !hasAnalysis}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">Error Breakdown (last 20)</h3>
						<div class="flex h-56 flex-col items-center justify-center gap-2">
							<p class="text-sm text-neutral-600">Analyze your games to unlock this insight</p>
							<a href="/games" class="text-xs font-medium text-gold hover:underline">Go to Games</a>
						</div>
					</div>
				{/if}

				<!-- Result Distribution (sync-only) -->
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
				{#if hasAnalysis && summary.byTimeControl && Object.keys(summary.byTimeControl).length > 0}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">By Time Control</h3>
						<TimeControlPerf byTimeControl={summary.byTimeControl} />
					</div>
				{:else if !hasAnalysis}
					<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
						<h3 class="mb-3 text-sm font-medium text-neutral-300">By Time Control</h3>
						<div class="flex h-56 flex-col items-center justify-center gap-2">
							<p class="text-sm text-neutral-600">Analyze your games to unlock this insight</p>
							<a href="/games" class="text-xs font-medium text-gold hover:underline">Go to Games</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- Rating over time (full width, sync-only) -->
			{#if trends?.length > 0}
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<h3 class="mb-3 text-sm font-medium text-neutral-300">Rating Over Time</h3>
					<RatingTrend {trends} />
				</div>
			{/if}

			<!-- Top Openings (full width, sync-only) -->
			{#if summary.topOpenings?.length > 0}
				<div>
					<h2 class="mb-3 text-sm font-medium text-neutral-300">Top Openings</h2>
					<div
						class="divide-y divide-neutral-800 rounded-sm border border-neutral-800 bg-neutral-900"
					>
						{#each summary.topOpenings as opening, i (i)}
							<div class="px-4 py-3">
								<div class="flex items-center justify-between">
									<div>
										<p class="text-sm text-neutral-200">{opening.name}</p>
										<p class="text-xs text-neutral-500">
											{opening.eco ? `${opening.eco} · ` : ''}{opening.games} game{opening.games !==
											1
												? 's'
												: ''}
										</p>
									</div>
									<p class="text-sm font-medium text-neutral-200">{opening.winRate}%</p>
								</div>
								<div class="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-neutral-800">
									<div class="h-full rounded-sm bg-gold" style="width: {opening.winRate}%"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<EmptyState
				title="No insights yet"
				description="Sync your Lichess games to start seeing insights about your play."
				actionLabel="Go to Settings"
				actionHref="/settings"
			/>
		{/if}
	</div>
</div>
