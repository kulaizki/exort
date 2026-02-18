<script lang="ts">
	import { slide } from 'svelte/transition';

	let mobileOpen = $state(false);

	function scrollTo(e: MouseEvent, selector: string) {
		e.preventDefault();
		document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		mobileOpen = false;
	}

	function scrollTop(e: MouseEvent) {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	const navLinks = [
		{ href: '#features', label: 'Features' },
		{ href: '#how-it-works', label: 'How It Works' }
	];
</script>

<header class="fixed top-0 right-0 left-0 z-50 sm:px-4 sm:pt-4">
	<nav class="mx-auto max-w-6xl border border-neutral-200/10 bg-neutral-950/60 px-4 py-3 backdrop-blur-xl sm:px-6">
		<div class="relative flex items-center justify-between">
			<!-- Logo -->
			<a
				href="/"
				onclick={scrollTop}
				class="flex items-center gap-2 font-logo text-lg font-bold tracking-tight text-white"
			>
				<img src="/exort-logo.svg" alt="" class="h-7 w-auto" />
				exort
			</a>

			<!-- Nav links — centered -->
			<div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						onclick={(e) => scrollTo(e, link.href)}
						class="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- CTA — right -->
			<div class="hidden items-center gap-3 md:flex">
				<a
					href="/login"
					class="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
				>
					Sign In
				</a>
				<a
					href="/register"
					class="rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
				>
					Get Started
				</a>
			</div>

			<!-- Mobile toggle -->
			<button
				class="p-2 text-neutral-400 transition-colors hover:text-neutral-200 md:hidden"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label="Toggle menu"
			>
				<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					{#if mobileOpen}
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileOpen}
			<div transition:slide={{ duration: 200 }} class="overflow-hidden md:hidden">
				<div class="mt-4 flex flex-col gap-3 border-t border-neutral-200/10 pt-4">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							onclick={(e) => scrollTo(e, link.href)}
							class="block py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
						>
							{link.label}
						</a>
					{/each}
					<div class="flex flex-col gap-2 border-t border-neutral-200/10 pt-3">
						<a
							href="/login"
							class="block py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
						>
							Sign In
						</a>
						<a
							href="/register"
							class="rounded-sm bg-gold px-4 py-2 text-center text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
						>
							Get Started
						</a>
					</div>
				</div>
			</div>
		{/if}
	</nav>
</header>
