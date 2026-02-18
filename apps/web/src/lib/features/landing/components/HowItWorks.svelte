<script lang="ts">
	import { inview } from '$lib/actions/inview';

	const steps = [
		{
			number: '01',
			title: 'Connect',
			description:
				'Link your Lichess account. Public games are synced automatically — no tokens needed.',
			detail: 'Delta sync — only new games are fetched'
		},
		{
			number: '02',
			title: 'Analyze',
			description:
				'Stockfish 18 evaluates every move at depth 20. Accuracy, blunders, and openings — computed automatically.',
			detail: 'Centipawn loss, phase errors, and more'
		},
		{
			number: '03',
			title: 'Improve',
			description:
				'Ask the AI coach about your weaknesses, patterns, and progress. Advice grounded in your real data.',
			detail: 'Powered by structured RAG — not generic tips'
		}
	];
</script>

<section id="how-it-works" class="bg-neutral-900/50 py-20 sm:py-24">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Section header -->
		<div use:inview class="fade-up mb-12 space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-sm border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
			>
				How It Works
			</div>
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Three steps to
				<span class="text-gold">better chess</span>
			</h2>
		</div>

		<!-- Steps -->
		<div class="relative grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Connection line (desktop) -->
			<div
				class="pointer-events-none absolute top-14 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent md:block"
			></div>

			{#each steps as step, i (step.number)}
				<div
					use:inview
					class="fade-up relative rounded border border-neutral-700 bg-neutral-950 p-6 transition-colors hover:border-gold/20"
					style="--delay: {i * 0.15}s"
				>
					<div
						class="mb-4 flex size-10 items-center justify-center rounded-sm border border-gold/20 bg-neutral-900 text-sm font-bold text-gold"
					>
						{step.number}
					</div>
					<h3 class="mb-2 text-lg font-semibold text-white">{step.title}</h3>
					<p class="mb-3 text-sm leading-relaxed text-neutral-400">{step.description}</p>
					<p class="text-xs text-gold/70">{step.detail}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
