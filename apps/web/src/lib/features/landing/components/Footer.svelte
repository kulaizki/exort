<script lang="ts">
	import { inview } from '$lib/actions/inview';

	function scrollTo(e: MouseEvent, selector: string) {
		e.preventDefault();
		document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	const footerLinks = {
		product: {
			title: 'Product',
			links: [
				{ label: 'Dashboard', href: '/dashboard' },
				{ label: 'Games', href: '/games' },
				{ label: 'AI Coach', href: '/chat' }
			]
		},
		platform: {
			title: 'Platform',
			links: [
				{ label: 'Features', href: '#features' },
				{ label: 'How It Works', href: '#how-it-works' }
			]
		}
	};
</script>

<footer use:inview class="fade-up border-t border-neutral-700/50 bg-neutral-900/50">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
			<!-- Brand column -->
			<div class="sm:col-span-2">
				<a href="/" class="mb-4 inline-flex items-center gap-2 font-logo text-lg font-bold tracking-tight text-white">
					<img src="/exort-logo.svg" alt="" class="h-7 w-auto" />
					exort
				</a>
				<p class="mb-4 max-w-xs text-sm text-neutral-400">
					Sync your Lichess games, analyze with Stockfish, and get AI-powered coaching
					to improve your chess.
				</p>
				<a
					href="https://github.com/kulaizki/exort"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
						/>
					</svg>
					View on GitHub
				</a>
			</div>

			<!-- Link columns -->
			{#each Object.values(footerLinks) as section (section.title)}
				<div>
					<h4 class="mb-3 text-sm font-semibold text-white sm:mb-4">{section.title}</h4>
					<ul class="space-y-2 sm:space-y-3">
						{#each section.links as link (link.label)}
							<li>
								{#if link.href.startsWith('#')}
									<a
										href={link.href}
										onclick={(e) => scrollTo(e, link.href)}
										class="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
									>
										{link.label}
									</a>
								{:else}
									<a
										href={link.href}
										class="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
									>
										{link.label}
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Bottom bar -->
		<div
			class="mt-8 flex flex-col items-center justify-between gap-3 border-t border-neutral-700/50 pt-6 text-center sm:mt-12 sm:flex-row sm:pt-8 sm:text-left"
		>
			<p class="text-sm text-neutral-400">
				&copy; {new Date().getFullYear()} exort. All rights reserved.
			</p>
			<p class="text-sm text-neutral-400">
				Built by <a
					href="https://www.fitzsixto.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="underline underline-offset-2 transition-colors hover:text-neutral-200"
				>
					Fitzsixto
				</a>
			</p>
		</div>
	</div>
</footer>
