<script lang="ts">
	import { inview } from '$lib/actions/inview';
</script>

<section class="relative overflow-hidden py-20 sm:py-24">
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-gold/10"></div>

	<div class="relative mx-auto max-w-6xl px-6">
		<div
			use:inview
			class="fade-up relative rounded border border-neutral-700 bg-neutral-900 p-12 text-center sm:p-16"
		>
			<!-- Corner accents -->
			<div class="absolute top-0 left-0 h-16 w-px bg-gradient-to-b from-gold/40 to-transparent"></div>
			<div class="absolute top-0 left-0 h-px w-16 bg-gradient-to-r from-gold/40 to-transparent"></div>
			<div class="absolute top-0 right-0 h-16 w-px bg-gradient-to-b from-gold/40 to-transparent"></div>
			<div class="absolute top-0 right-0 h-px w-16 bg-gradient-to-l from-gold/40 to-transparent"></div>
			<div class="absolute bottom-0 left-0 h-16 w-px bg-gradient-to-t from-gold/40 to-transparent"></div>
			<div class="absolute bottom-0 left-0 h-px w-16 bg-gradient-to-r from-gold/40 to-transparent"></div>
			<div class="absolute bottom-0 right-0 h-16 w-px bg-gradient-to-t from-gold/40 to-transparent"></div>
			<div class="absolute bottom-0 right-0 h-px w-16 bg-gradient-to-l from-gold/40 to-transparent"></div>

			<h2 class="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Ready to improve your
				<span class="text-gold">
					chess
				</span>?
			</h2>
			<p class="mx-auto mb-8 max-w-xl text-neutral-400">
				Connect your Lichess account and start getting AI-powered insights in minutes.
			</p>
			<a
				href="/register"
				class="group inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
			>
				Get Started Free
				<svg
					class="size-4 transition-transform group-hover:translate-x-0.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	</div>
</section>
