<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>dashboard — exort</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
	<div class="w-full max-w-sm rounded-sm border border-neutral-800 bg-neutral-900 p-6 text-center">
		<p class="text-sm text-neutral-400">Signed in as</p>
		<p class="mt-1 text-lg font-semibold text-neutral-200">{data.user.name || data.user.email}</p>
		<p class="mt-4 text-xs text-neutral-500">Dashboard coming soon.</p>
	</div>
</div>
