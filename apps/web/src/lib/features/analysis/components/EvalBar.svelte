<script lang="ts">
	interface Props {
		evalCp: number | null;
	}

	let { evalCp }: Props = $props();

	let whitePercent = $derived.by(() => {
		if (evalCp === null) return 50;
		return 50 + 50 * (2 / (1 + Math.exp(-0.004 * evalCp)) - 1);
	});

	let evalText = $derived.by(() => {
		if (evalCp === null) return '\u2013';
		const value = evalCp / 100;
		const formatted = Math.abs(value).toFixed(1);
		if (value > 0) return `+${formatted}`;
		if (value < 0) return `-${formatted}`;
		return '0.0';
	});

	let whiteWinning = $derived(evalCp !== null && evalCp >= 0);
</script>

<div
	class="relative flex w-7 flex-col overflow-hidden rounded-sm border border-neutral-800"
	style="height: 100%;"
>
	<!-- Black portion (top) -->
	<div
		class="bg-neutral-900 flex items-start justify-center"
		style="height: {100 - whitePercent}%; transition: height 300ms ease;"
	>
		{#if !whiteWinning}
			<span class="text-neutral-200 mt-1 select-none text-[10px] font-bold leading-none">
				{evalText}
			</span>
		{/if}
	</div>

	<!-- White portion (bottom) -->
	<div
		class="bg-neutral-200 flex items-end justify-center"
		style="height: {whitePercent}%; transition: height 300ms ease;"
	>
		{#if whiteWinning}
			<span class="text-neutral-900 mb-1 select-none text-[10px] font-bold leading-none">
				{evalText}
			</span>
		{/if}
	</div>
</div>
