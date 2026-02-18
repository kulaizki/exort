<script lang="ts">
	import { inview } from '$lib/actions/inview';

	const steps = [
		{
			number: '01',
			title: 'Connect',
			description: 'Link your Lichess username. No OAuth needed — just your public username.'
		},
		{
			number: '02',
			title: 'Analyze',
			description:
				'Stockfish evaluates every move of every game. Accuracy, blunders, openings — all computed automatically.'
		},
		{
			number: '03',
			title: 'Improve',
			description:
				'Ask the AI coach about your weaknesses, patterns, and progress. Get advice grounded in your real data.'
		}
	];
</script>

<section id="how-it-works" class="bg-neutral-900/50 py-20 sm:py-24">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Section header -->
		<div use:inview class="fade-up mb-16 space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-sm border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
			>
				How It Works
			</div>
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Three steps to
				<span
					class="text-gold"
				>
					better chess
				</span>
			</h2>
		</div>

		<!-- Steps -->
		<div class="relative grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Connection line (desktop) -->
			<div
				class="pointer-events-none absolute top-16 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent md:block"
			></div>

			{#each steps as step, i}
				<div
					use:inview
					class="fade-up relative rounded border border-neutral-700 bg-neutral-950 p-6"
					style="--delay: {i * 0.15}s"
				>
					<div
						class="mb-4 flex size-12 items-center justify-center rounded-sm border border-gold/20 bg-neutral-900 text-sm font-bold text-gold"
					>
						{step.number}
					</div>
					<h3 class="mb-2 text-lg font-semibold text-white">{step.title}</h3>
					<p class="text-sm leading-relaxed text-neutral-400">{step.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
