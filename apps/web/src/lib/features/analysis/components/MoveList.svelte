<script lang="ts">
	interface ProcessedMove {
		ply: number;
		san: string;
		moveNumber: number;
		color: 'white' | 'black';
		fen: string;
		lastMove: [string, string] | undefined;
		isCheck: boolean;
		evalCp: number | null;
		bestMoveUci: string | null;
		classification: string | null;
	}

	interface Props {
		moves: ProcessedMove[];
		currentPly: number;
		onSelectPly: (ply: number) => void;
	}

	let { moves, currentPly, onSelectPly }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();

	// Group moves into pairs by moveNumber
	let movePairs = $derived.by(() => {
		const pairs: { moveNumber: number; white?: ProcessedMove; black?: ProcessedMove }[] = [];

		for (const move of moves) {
			let pair = pairs.find((p) => p.moveNumber === move.moveNumber);
			if (!pair) {
				pair = { moveNumber: move.moveNumber };
				pairs.push(pair);
			}
			if (move.color === 'white') {
				pair.white = move;
			} else {
				pair.black = move;
			}
		}

		return pairs;
	});

	function classificationColor(classification: string | null): string {
		switch (classification) {
			case 'BLUNDER':
				return 'text-red-400';
			case 'MISTAKE':
				return 'text-orange-400';
			case 'INACCURACY':
				return 'text-yellow-400';
			case 'BRILLIANT':
				return 'text-cyan-400';
			case 'EXCELLENT':
				return 'text-green-400';
			default:
				return 'text-neutral-200';
		}
	}

	// Auto-scroll active move into view
	$effect(() => {
		if (!containerEl) return;
		const activeEl = containerEl.querySelector(`[data-ply="${currentPly}"]`);
		if (activeEl) {
			activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	});
</script>

<div
	bind:this={containerEl}
	class="custom-scrollbar max-h-96 overflow-y-auto rounded-sm border border-neutral-800 bg-neutral-900 lg:max-h-none lg:min-h-0 lg:flex-1"
>
	<!-- Start position -->
	<button
		type="button"
		data-ply="0"
		class="w-full px-3 py-1.5 text-left font-mono text-sm transition-colors {currentPly === 0
			? 'bg-[#FFB800]/20 text-[#FFB800]'
			: 'text-neutral-400 hover:bg-neutral-800'}"
		onclick={() => onSelectPly(0)}
	>
		Start
	</button>

	{#each movePairs as pair (pair.moveNumber)}
		<div
			class="grid grid-cols-[2.5rem_1fr_1fr] items-stretch border-t border-neutral-800/50 font-mono text-sm"
		>
			<!-- Move number -->
			<span class="flex items-center justify-center text-neutral-500">
				{pair.moveNumber}.
			</span>

			<!-- White move -->
			{#if pair.white}
				<button
					type="button"
					data-ply={pair.white.ply}
					class="px-2 py-1 text-left transition-colors {currentPly === pair.white.ply
						? 'bg-[#FFB800]/20 text-[#FFB800]'
						: `${classificationColor(pair.white.classification)} hover:bg-neutral-800`}"
					onclick={() => pair.white && onSelectPly(pair.white.ply)}
				>
					{pair.white.san}
				</button>
			{:else}
				<span></span>
			{/if}

			<!-- Black move -->
			{#if pair.black}
				<button
					type="button"
					data-ply={pair.black.ply}
					class="px-2 py-1 text-left transition-colors {currentPly === pair.black.ply
						? 'bg-[#FFB800]/20 text-[#FFB800]'
						: `${classificationColor(pair.black.classification)} hover:bg-neutral-800`}"
					onclick={() => pair.black && onSelectPly(pair.black.ply)}
				>
					{pair.black.san}
				</button>
			{:else}
				<span></span>
			{/if}
		</div>
	{/each}
</div>
