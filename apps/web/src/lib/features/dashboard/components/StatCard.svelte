<script lang="ts">
	type Props = {
		label: string;
		value: string | number;
		subtext?: string;
		trend?: 'up' | 'down' | 'neutral';
	};

	let { label, value, subtext, trend }: Props = $props();
</script>

<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-4">
	<p class="text-xs font-medium text-neutral-500">{label}</p>
	<div class="mt-1 flex items-baseline gap-2">
		<p class="text-2xl font-bold text-neutral-200">{value}</p>
		{#if trend && trend !== 'neutral'}
			<span class="text-xs font-medium {trend === 'up' ? 'text-green-400' : 'text-red-400'}">
				{trend === 'up' ? '+' : '-'}
			</span>
		{/if}
	</div>
	{#if subtext}
		<p class="mt-1 text-xs text-neutral-500">{subtext}</p>
	{/if}
</div>
