<script lang="ts">
	import { inview } from '$lib/actions/inview';
</script>

{#snippet syncIcon()}
	<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
		/>
	</svg>
{/snippet}

{#snippet analysisIcon()}
	<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
		/>
	</svg>
{/snippet}

{#snippet coachingIcon()}
	<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
		/>
	</svg>
{/snippet}

<!-- Top accent line -->
<div
	class="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
></div>

<section id="features" class="py-20 sm:py-24">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Section header -->
		<div use:inview class="fade-up mb-12 space-y-4 text-center">
			<div
				class="inline-flex items-center gap-2 rounded-sm border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
			>
				Features
			</div>
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Everything you need to
				<span class="text-gold">improve</span>
			</h2>
			<p class="mx-auto max-w-2xl text-neutral-400">
				From game import to personalized coaching — one platform, zero manual work.
			</p>
		</div>

		<!-- Bento grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Engine Analysis — hero card (lg:col-span-2) -->
			<div
				use:inview
				class="fade-up rounded border border-neutral-700 bg-neutral-900 p-6 transition-colors hover:border-gold/20 lg:col-span-2"
			>
				<div class="mb-4 inline-flex rounded-sm border border-gold/20 bg-gold/10 p-2.5 text-gold">
					{@render analysisIcon()}
				</div>
				<h3 class="mb-2 text-lg font-semibold text-white">Engine Analysis</h3>
				<p class="mb-6 text-sm leading-relaxed text-neutral-400">
					Stockfish 18 evaluates every move. Get accuracy scores, blunder counts, and
					phase-by-phase breakdowns.
				</p>

				<!-- Mock analysis UI -->
				<div class="rounded border border-neutral-700 bg-neutral-950 p-4">
					<div class="mb-3 flex items-center justify-between text-xs">
						<span class="text-neutral-400">Game #a1b2c3d4</span>
						<span class="font-semibold text-gold">87.4% accuracy</span>
					</div>

					<!-- Eval bar -->
					<div class="mb-3 h-1.5 rounded-full bg-neutral-800">
						<div class="h-full rounded-full bg-gold" style="width: 62%"></div>
					</div>

					<!-- Move annotations -->
					<div class="space-y-1.5 font-mono text-xs">
						<div class="flex justify-between">
							<span class="text-neutral-400">12. Nxd5</span>
							<span class="text-green-400">+1.2</span>
						</div>
						<div class="flex justify-between">
							<span class="text-neutral-400">13. Qxf7+??</span>
							<span class="text-red-400">-0.8 blunder</span>
						</div>
						<div class="flex justify-between">
							<span class="text-neutral-400">14. Kd1!</span>
							<span class="text-gold">+2.4 brilliant</span>
						</div>
						<div class="flex justify-between">
							<span class="text-neutral-400">15. Bxe6</span>
							<span class="text-green-400">+1.8</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Lichess Sync -->
			<div
				use:inview
				class="fade-up rounded border border-neutral-700 bg-neutral-900 p-6 transition-colors hover:border-gold/20"
				style="--delay: 0.1s"
			>
				<div class="mb-4 inline-flex rounded-sm border border-gold/20 bg-gold/10 p-2.5 text-gold">
					{@render syncIcon()}
				</div>
				<h3 class="mb-2 text-lg font-semibold text-white">Lichess Sync</h3>
				<p class="mb-6 text-sm leading-relaxed text-neutral-400">
					Automatically sync your games from Lichess. Delta sync fetches only new games —
					fast and efficient.
				</p>

				<!-- Mock game feed -->
				<div class="space-y-2">
					<div
						class="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-xs"
					>
						<span class="size-1.5 rounded-full bg-green-400"></span>
						<span class="text-neutral-200">Rapid &bull; 10+0</span>
						<span class="ml-auto font-medium text-green-400">Win</span>
					</div>
					<div
						class="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-xs"
					>
						<span class="size-1.5 rounded-full bg-red-400"></span>
						<span class="text-neutral-200">Blitz &bull; 3+2</span>
						<span class="ml-auto font-medium text-red-400">Loss</span>
					</div>
					<div
						class="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-xs"
					>
						<span class="size-1.5 rounded-full bg-green-400"></span>
						<span class="text-neutral-200">Classical &bull; 30+0</span>
						<span class="ml-auto font-medium text-green-400">Win</span>
					</div>
					<div
						class="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-xs"
					>
						<span class="size-1.5 rounded-full bg-neutral-400"></span>
						<span class="text-neutral-200">Blitz &bull; 5+3</span>
						<span class="ml-auto font-medium text-neutral-400">Draw</span>
					</div>
				</div>
			</div>

			<!-- AI Coaching — full width -->
			<div
				use:inview
				class="fade-up rounded border border-neutral-700 bg-neutral-900 p-6 transition-colors hover:border-gold/20 sm:col-span-2 lg:col-span-3"
				style="--delay: 0.2s"
			>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Left: Info -->
					<div>
						<div
							class="mb-4 inline-flex rounded-sm border border-gold/20 bg-gold/10 p-2.5 text-gold"
						>
							{@render coachingIcon()}
						</div>
						<h3 class="mb-2 text-lg font-semibold text-white">AI Coaching</h3>
						<p class="text-sm leading-relaxed text-neutral-400">
							Ask questions about your play. Powered by structured RAG over your real
							game data — not generic advice. Get actionable insights grounded in your
							actual performance.
						</p>
					</div>

					<!-- Right: Chat mock -->
					<div class="space-y-3">
						<div class="rounded border border-neutral-700 bg-neutral-950 px-4 py-3 text-xs">
							<div class="mb-1 text-[10px] font-medium text-neutral-400">You</div>
							<div class="text-neutral-200">
								What's my biggest weakness in blitz games?
							</div>
						</div>
						<div class="rounded border border-gold/15 bg-gold/5 px-4 py-3 text-xs">
							<div class="mb-1 text-[10px] font-medium text-gold">AI Coach</div>
							<div class="text-neutral-200">
								Based on your last 50 blitz games, your endgame play drops
								significantly after move 40. You're converting only
								<span class="font-medium text-gold">34%</span> of winning positions in
								rook endgames. I'd recommend practicing basic rook endings and
								focusing on king activity in the late middlegame.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
