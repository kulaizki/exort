<script lang="ts">
	type Props = {
		title: string;
		description: string;
		actionLabel?: string;
		actionHref?: string;
		onclick?: () => void;
	};

	let { title, description, actionLabel, actionHref, onclick }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center rounded-sm border border-dashed border-neutral-700 px-6 py-12 text-center">
	<svg class="mb-4 h-10 w-10 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
	<h3 class="text-sm font-medium text-neutral-300">{title}</h3>
	<p class="mt-1 max-w-xs text-xs text-neutral-500">{description}</p>
	{#if actionLabel}
		{#if actionHref}
			<a href={actionHref} class="mt-4 rounded-sm bg-gold px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light">{actionLabel}</a>
		{:else if onclick}
			<button {onclick} class="mt-4 cursor-pointer rounded-sm bg-gold px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light">{actionLabel}</button>
		{/if}
	{/if}
</div>
