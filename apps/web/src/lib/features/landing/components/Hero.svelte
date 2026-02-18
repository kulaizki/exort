<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import { ChessboardBg } from '$lib/components';

	let chessboard: ReturnType<typeof ChessboardBg>;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	class="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
	onmousemove={(e) => chessboard?.trackMouse(e)}
	onmouseleave={() => chessboard?.clearMouse()}
>
	<!-- Interactive chessboard grid -->
	<div class="pointer-events-none absolute inset-0">
		<ChessboardBg bind:this={chessboard} />
	</div>

	<!-- Subtle radial glow -->
	<div class="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="h-[600px] w-[600px] rounded-full bg-gold/6 blur-[150px]"></div>
	</div>

	<div class="relative mx-auto max-w-3xl px-6 text-center">
		<div use:inview class="fade-up space-y-6">
			<h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
				Turn every game into
				<br />
				<span class="text-gold">a lesson</span>
			</h1>

			<p class="mx-auto max-w-xl text-lg text-neutral-400">
				Exort syncs your Lichess games, analyzes them with Stockfish, and coaches you
				with AI — so you improve faster.
			</p>

			<!-- CTAs -->
			<div class="flex items-center justify-center gap-3 pt-2">
				<a
					href="/register"
					class="group inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
				>
					Get Started
					<svg
						class="size-4 transition-transform group-hover:translate-x-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
				<a
					href="#features"
					class="rounded-sm border border-neutral-700 bg-neutral-800 px-6 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
				>
					Learn More
				</a>
			</div>

			<!-- Tech specs -->
			<div class="flex justify-center divide-x divide-neutral-700 pt-6">
				<div class="pr-6">
					<div class="text-sm font-semibold text-white">Stockfish 18</div>
					<div class="text-xs text-neutral-400">Latest engine</div>
				</div>
				<div class="px-6">
					<div class="text-sm font-semibold text-white">Depth 20</div>
					<div class="text-xs text-neutral-400">Analysis depth</div>
				</div>
				<div class="pl-6">
					<div class="text-sm font-semibold text-white">Gemini AI</div>
					<div class="text-xs text-neutral-400">Coaching model</div>
				</div>
			</div>
		</div>
	</div>
</section>
