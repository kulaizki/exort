<script lang="ts">
	import { inview } from '$lib/actions/inview';

	const features = [
		{
			id: 'sync',
			title: 'Lichess Sync',
			description:
				'Automatically sync your games from Lichess. Delta sync fetches only new games — fast and efficient.'
		},
		{
			id: 'analysis',
			title: 'Engine Analysis',
			description:
				'Stockfish 18 evaluates every move. Get accuracy scores, blunder counts, and phase-by-phase breakdowns.'
		},
		{
			id: 'coaching',
			title: 'AI Coaching',
			description:
				'Ask questions about your play. Powered by structured RAG over your real game data — not generic advice.'
		}
	];
</script>

{#snippet syncIcon()}
	<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
	</svg>
{/snippet}

{#snippet analysisIcon()}
	<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
	</svg>
{/snippet}

{#snippet coachingIcon()}
	<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
	</svg>
{/snippet}

<section id="features" class="border-t border-neutral-700/50 py-20 sm:py-24">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Section header -->
		<div use:inview class="fade-up mb-16 space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-sm border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
			>
				Features
			</div>
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Everything you need to
				<span
					class="text-gold"
				>
					improve
				</span>
			</h2>
			<p class="mx-auto max-w-2xl text-neutral-400">
				From game import to personalized coaching — one platform, zero manual work.
			</p>
		</div>

		<!-- Feature cards -->
		<div class="grid grid-cols-1 gap-px bg-neutral-700/50 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature, i (feature.id)}
				<div
					use:inview
					class="fade-up bg-neutral-950 p-8"
					style="--delay: {i * 0.1}s"
				>
					<div
						class="mb-4 inline-flex rounded-sm border border-gold/20 bg-gold/10 p-3 text-gold"
					>
						{#if feature.id === 'sync'}
							{@render syncIcon()}
						{:else if feature.id === 'analysis'}
							{@render analysisIcon()}
						{:else}
							{@render coachingIcon()}
						{/if}
					</div>
					<h3 class="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
					<p class="text-sm leading-relaxed text-neutral-400">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
