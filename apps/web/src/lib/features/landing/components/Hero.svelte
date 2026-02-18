<script lang="ts">
	import { inview } from '$lib/actions/inview';
</script>

<section class="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
	<!-- Subtle grid background -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M60 0H0v1h60z M0 0v60h1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)"
	></div>

	<!-- Glow orb -->
	<div class="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="h-[500px] w-[500px] rounded-full bg-gold/8 blur-[120px]"></div>
	</div>

	<div class="relative mx-auto max-w-6xl px-6 text-center">
		<div use:inview class="fade-up space-y-6">
			<!-- Headline -->
			<h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
				Turn every game into
				<br />
				<span class="text-gold">a lesson</span>
			</h1>

			<!-- Subheadline -->
			<p class="mx-auto max-w-2xl text-lg text-neutral-400">
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
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
				<a
					href="#features"
					class="rounded-sm border border-neutral-700 bg-neutral-800 px-6 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
				>
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>
