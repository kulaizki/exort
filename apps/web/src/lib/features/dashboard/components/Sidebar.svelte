<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		user: { name: string; email: string; image?: string | null };
		collapsed: boolean;
		mobileOpen: boolean;
		onToggle: () => void;
		onMobileClose: () => void;
	};

	let { user, collapsed, mobileOpen, onToggle, onMobileClose }: Props = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/dashboard/games', label: 'Games', icon: 'games' },
		{ href: '/dashboard/insights', label: 'Insights', icon: 'insights' },
		{ href: '/dashboard/coach', label: 'Coach', icon: 'coach' }
	];

	const bottomItems = [
		{ href: '/dashboard/settings', label: 'Settings', icon: 'settings' }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') return page.url.pathname === '/dashboard';
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile overlay -->
{#if mobileOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
		onclick={onMobileClose}
		onkeydown={(e) => e.key === 'Escape' && onMobileClose()}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 z-50 flex h-full flex-col border-r border-neutral-800 bg-neutral-900 transition-all duration-200
		{mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
		{collapsed ? 'w-16' : 'w-56'}"
>
	<!-- Header -->
	<div class="flex h-14 items-center gap-2 border-b border-neutral-800 px-4">
		{#if !collapsed}
			<img src="/exort-logo.svg" alt="" class="h-5 w-auto" />
			<span class="font-logo text-sm font-bold text-neutral-200">exort</span>
		{:else}
			<img src="/exort-logo.svg" alt="" class="mx-auto h-5 w-auto" />
		{/if}
	</div>

	<!-- Nav -->
	<nav class="flex-1 space-y-1 px-2 py-3">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				onclick={() => mobileOpen && onMobileClose()}
				class="flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors
					{active ? 'bg-gold/10 text-gold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}
					{collapsed ? 'justify-center' : ''}"
			>
				<span class="flex h-5 w-5 shrink-0 items-center justify-center">
					{#if item.icon === 'dashboard'}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
					{:else if item.icon === 'games'}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
					{:else if item.icon === 'insights'}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
					{:else if item.icon === 'coach'}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
					{/if}
				</span>
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom section -->
	<div class="space-y-1 border-t border-neutral-800 px-2 py-3">
		{#each bottomItems as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				onclick={() => mobileOpen && onMobileClose()}
				class="flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors
					{active ? 'bg-gold/10 text-gold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}
					{collapsed ? 'justify-center' : ''}"
			>
				<span class="flex h-5 w-5 shrink-0 items-center justify-center">
					<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
				</span>
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}

		<!-- User -->
		<div class="flex items-center gap-3 rounded-sm px-3 py-2 {collapsed ? 'justify-center' : ''}">
			<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
				{user.name?.[0]?.toUpperCase() || '?'}
			</div>
			{#if !collapsed}
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-neutral-200">{user.name}</p>
					<p class="truncate text-xs text-neutral-500">{user.email}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Collapse toggle (desktop only) -->
	<button
		onclick={onToggle}
		aria-label="Toggle sidebar"
		class="hidden border-t border-neutral-800 p-3 text-neutral-500 transition-colors hover:text-neutral-300 lg:block"
	>
		<svg class="mx-auto h-4 w-4 transition-transform {collapsed ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
	</button>
</aside>
