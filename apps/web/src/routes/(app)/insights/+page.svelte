<script lang="ts">
	import { EmptyState } from '$lib/features/dashboard';

	let { data } = $props();
	const summary = $derived(data.summary);
	const trends = $derived(data.trends);
	const hasData = $derived(summary && (summary.totalGames ?? 0) > 0);
</script>

<svelte:head>
	<title>insights — exort</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-lg font-semibold text-neutral-200">Insights</h1>
		<p class="mt-1 text-sm text-neutral-500">Understand your strengths and weaknesses</p>
	</div>

	{#if hasData}
		<!-- Accuracy overview -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
				<h3 class="text-xs font-medium text-neutral-500">Overall Accuracy</h3>
				<p class="mt-2 text-3xl font-bold text-gold">{summary.avgAccuracy?.toFixed(1) ?? '--'}%</p>
				<p class="mt-1 text-xs text-neutral-500">across {summary.totalGames} games</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
				<h3 class="text-xs font-medium text-neutral-500">Average Centipawn Loss</h3>
				<p class="mt-2 text-3xl font-bold text-neutral-200">{summary.avgCentipawnLoss?.toFixed(0) ?? '--'}</p>
				<p class="mt-1 text-xs text-neutral-500">lower is better</p>
			</div>
		</div>

		<!-- Error rates -->
		<div>
			<h2 class="mb-3 text-sm font-medium text-neutral-300">Error Rates (per game)</h2>
			<div class="grid grid-cols-3 gap-3">
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
					<p class="text-xl font-bold text-red-400">{summary.avgBlunders?.toFixed(1) ?? '--'}</p>
					<p class="mt-1 text-xs text-neutral-500">Blunders</p>
				</div>
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
					<p class="text-xl font-bold text-orange-400">{summary.avgMistakes?.toFixed(1) ?? '--'}</p>
					<p class="mt-1 text-xs text-neutral-500">Mistakes</p>
				</div>
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
					<p class="text-xl font-bold text-yellow-400">{summary.avgInaccuracies?.toFixed(1) ?? '--'}</p>
					<p class="mt-1 text-xs text-neutral-500">Inaccuracies</p>
				</div>
			</div>
		</div>

		<!-- Time control breakdown -->
		{#if summary.byTimeControl}
			<div>
				<h2 class="mb-3 text-sm font-medium text-neutral-300">By Time Control</h2>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each Object.entries(summary.byTimeControl) as [tc, stats]}
						<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
							<p class="text-xs font-medium capitalize text-neutral-400">{tc}</p>
							<p class="mt-1 text-lg font-bold text-neutral-200">{(stats as any).accuracy?.toFixed(1) ?? '--'}%</p>
							<p class="text-xs text-neutral-500">{(stats as any).games ?? 0} games</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Opening breakdown -->
		{#if summary.topOpenings?.length > 0}
			<div>
				<h2 class="mb-3 text-sm font-medium text-neutral-300">Top Openings</h2>
				<div class="divide-y divide-neutral-800 rounded-sm border border-neutral-800 bg-neutral-900">
					{#each summary.topOpenings.slice(0, 8) as opening}
						<div class="flex items-center justify-between px-4 py-3">
							<div>
								<p class="text-sm text-neutral-200">{opening.name}</p>
								<p class="text-xs text-neutral-500">{opening.games} games</p>
							</div>
							<div class="text-right">
								<p class="text-sm font-medium text-neutral-200">{opening.winRate?.toFixed(0)}%</p>
								<p class="text-xs text-neutral-500">win rate</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Accuracy trend -->
		{#if trends?.accuracy?.length > 0}
			<div>
				<h2 class="mb-3 text-sm font-medium text-neutral-300">Accuracy Trend</h2>
				<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
					<div class="flex h-40 items-end gap-1">
						{#each trends.accuracy as point}
							{@const height = Math.max(4, (point.value / 100) * 100)}
							<div class="group relative flex-1">
								<div
									class="w-full rounded-t-sm bg-gold/60 transition-colors group-hover:bg-gold"
									style="height: {height}%"
								></div>
								<div class="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-sm bg-neutral-800 px-2 py-1 text-xs text-neutral-200 group-hover:block">
									{point.value.toFixed(1)}%
								</div>
							</div>
						{/each}
					</div>
					<p class="mt-2 text-center text-xs text-neutral-500">Accuracy over time</p>
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
