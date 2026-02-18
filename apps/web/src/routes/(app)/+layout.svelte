<script lang="ts">
	import { Sidebar } from '$lib/features/dashboard';

	let { data, children } = $props();
	let mobileOpen = $state(false);
</script>

<div class="min-h-screen bg-neutral-950">
	<Sidebar
		user={data.user}
		{mobileOpen}
		onMobileClose={() => (mobileOpen = false)}
	/>

	<!-- Mobile header -->
	<div class="sticky top-0 z-30 flex h-14 items-center border-b border-neutral-800 bg-neutral-950/90 px-4 backdrop-blur-sm lg:hidden">
		<button
			onclick={() => (mobileOpen = true)}
			aria-label="Open menu"
			class="cursor-pointer rounded-sm p-1.5 text-neutral-400 transition-colors hover:text-neutral-200"
		>
			<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
		</button>
		<div class="ml-3 flex items-center gap-1.5">
			<img src="/exort-logo.svg" alt="" class="h-4 w-auto" />
			<span class="font-logo text-sm font-bold text-neutral-200">exort</span>
		</div>
	</div>

	<!-- Main content -->
	<main class="lg:ml-56">
		<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
			{@render children()}
		</div>
	</main>
</div>
