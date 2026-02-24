<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { GameReview } from '$lib/features/analysis';

	let { data, form } = $props();
	const game = $derived(data.game);
	const metrics = $derived(game.metrics);
	const phases = $derived(metrics?.phaseErrors as Record<string, Record<string, number>> | null);
	let analyzing = $state(false);
	const hasAnalysis = $derived(!!game.analysisJob);
	const analysisStatus = $derived(game.analysisJob?.status);
	const isPending = $derived(analysisStatus === 'PENDING' || analysisStatus === 'PROCESSING');
	const isFailed = $derived(analysisStatus === 'FAILED');

	$effect(() => {
		if (!isPending) return;
		const interval = setInterval(() => invalidateAll(), 5000);
		return () => clearInterval(interval);
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>vs {game.opponent} — exort</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
<div class="space-y-6">
	<!-- Back link -->
	<a href="/games" class="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-200">
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
		Back to games
	</a>

	<!-- Header -->
	<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<span class="inline-flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold
						{game.result === 'win' ? 'bg-green-500/20 text-green-400' : game.result === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-700 text-neutral-400'}">
						{game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
					</span>
					<div>
						<h1 class="text-lg font-semibold text-neutral-200">vs {game.opponent}</h1>
						<p class="text-sm text-neutral-500">
							{game.color === 'white' ? 'Playing White' : 'Playing Black'}
							{#if game.playerRating}&middot; {game.playerRating}{/if}
							vs
							{#if game.opponentRating}{game.opponentRating}{/if}
						</p>
					</div>
				</div>
			</div>
			<div class="flex flex-wrap gap-2 text-xs text-neutral-500">
				<span class="rounded-sm bg-neutral-800 px-2 py-1 capitalize">{game.timeControl}</span>
				<span class="rounded-sm bg-neutral-800 px-2 py-1">{formatDate(game.playedAt)}</span>
				{#if game.rated}
					<span class="rounded-sm bg-neutral-800 px-2 py-1">Rated</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Interactive board -->
	{#if game.pgn}
		<GameReview pgn={game.pgn} color={game.color} moveEvaluations={game.moveEvaluations} />
	{/if}

	{#if metrics}
		<!-- Metrics panel -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-2xl font-bold text-gold">{metrics.accuracy.toFixed(1)}%</p>
				<p class="mt-1 text-xs text-neutral-500">Accuracy</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-2xl font-bold text-neutral-200">{metrics.centipawnLoss.toFixed(0)}</p>
				<p class="mt-1 text-xs text-neutral-500">Avg CPL</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-2xl font-bold text-red-400">{metrics.blunderCount}</p>
				<p class="mt-1 text-xs text-neutral-500">Blunders</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-2xl font-bold text-orange-400">{metrics.mistakeCount}</p>
				<p class="mt-1 text-xs text-neutral-500">Mistakes</p>
			</div>
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4 text-center">
				<p class="text-2xl font-bold text-yellow-400">{metrics.inaccuracyCount}</p>
				<p class="mt-1 text-xs text-neutral-500">Inaccuracies</p>
			</div>
		</div>

		<!-- Opening -->
		{#if metrics.openingName}
			<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
				<p class="text-xs font-medium text-neutral-500">Opening</p>
				<p class="mt-1 text-sm text-neutral-200">
					{#if metrics.openingEco}<span class="mr-1.5 text-gold">{metrics.openingEco}</span>{/if}
					{metrics.openingName}
				</p>
			</div>
		{/if}

		<!-- Phase breakdown -->
		{#if phases}
			<div>
				<h2 class="mb-3 text-sm font-medium text-neutral-300">Phase Breakdown</h2>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{#each ['opening', 'middlegame', 'endgame'] as phase (phase)}
						{@const p = phases[phase]}
						{#if p}
							<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
								<p class="mb-2 text-xs font-medium capitalize text-neutral-400">{phase}</p>
								<div class="flex gap-4 text-xs">
									<span class="text-red-400">{p.blunders ?? 0} blunders</span>
									<span class="text-orange-400">{p.mistakes ?? 0} mistakes</span>
									<span class="text-yellow-400">{p.inaccuracies ?? 0} inaccuracies</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

	{:else}
		<div class="rounded-sm border border-dashed border-neutral-700 px-6 py-8 text-center">
			{#if form?.analyzed}
				<p class="text-sm text-green-400">Analysis queued. The Stockfish worker will process this game shortly.</p>
			{:else if form?.analyzeError}
				<p class="text-sm text-red-400">{form.analyzeError}</p>
			{:else if isFailed}
				<p class="text-sm text-red-400">Analysis failed. The Stockfish worker encountered an error processing this game.</p>
				<form method="post" action="?/analyze" use:enhance={() => {
					analyzing = true;
					return async ({ update }) => {
						await update();
						analyzing = false;
						await invalidateAll();
					};
				}}>
					<button
						type="submit"
						disabled={analyzing}
						class="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
					>
						{analyzing ? 'Queuing...' : 'Retry Analysis'}
					</button>
				</form>
			{:else if hasAnalysis}
				<div class="flex items-center justify-center gap-2">
					<svg class="h-3.5 w-3.5 animate-spin text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
					<p class="text-sm text-neutral-400">Analysis is {analysisStatus?.toLowerCase() ?? 'pending'}...</p>
				</div>
			{:else}
				<p class="text-sm text-neutral-400">This game hasn't been analyzed yet.</p>
				<form method="post" action="?/analyze" use:enhance={() => {
					analyzing = true;
					return async ({ update }) => {
						await update();
						analyzing = false;
						await invalidateAll();
					};
				}}>
					<button
						type="submit"
						disabled={analyzing}
						class="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
					>
						<svg class="h-3.5 w-3.5 {analyzing ? 'animate-spin' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
						{analyzing ? 'Queuing...' : 'Analyze with Stockfish'}
					</button>
				</form>
			{/if}
		</div>
	{/if}

	<!-- Coach CTA -->
	<a
		href="/coach"
		class="inline-flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
		Ask coach about this game
	</a>
</div>
</div>
