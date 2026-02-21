<script lang="ts">
	import Chessboard from './Chessboard.svelte';
	import EvalBar from './EvalBar.svelte';
	import MoveList from './MoveList.svelte';
	import BoardControls from './BoardControls.svelte';
	import { createGameTree, type MoveEvaluation } from '../game-tree.svelte';

	interface Props {
		pgn: string;
		color: 'white' | 'black';
		moveEvaluations?: MoveEvaluation[];
	}

	let { pgn, color, moveEvaluations }: Props = $props();

	const result = $derived.by(() => {
		try {
			const tree = createGameTree(pgn, moveEvaluations);
			return { tree, error: null } as const;
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to parse game';
			return { tree: null, error: message } as const;
		}
	});

	let flipped = $state(false);
	const orientation = $derived<'white' | 'black'>(flipped ? (color === 'white' ? 'black' : 'white') : color);

	function flipBoard() {
		flipped = !flipped;
	}

	const hasEvals = $derived(!!moveEvaluations?.length);

	function handleKeydown(e: KeyboardEvent) {
		if (!result.tree) return;

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				result.tree.goBack();
				break;
			case 'ArrowRight':
				e.preventDefault();
				result.tree.goForward();
				break;
			case 'Home':
				e.preventDefault();
				result.tree.goToStart();
				break;
			case 'End':
				e.preventDefault();
				result.tree.goToEnd();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if result.error}
	<div class="rounded-sm border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
		{result.error}
	</div>
{:else if result.tree}
	{@const tree = result.tree}
	<div class="flex flex-col gap-4 lg:flex-row lg:gap-6">
		<!-- Eval bar + Board column -->
		<div class="flex gap-3 lg:gap-4">
			{#if hasEvals}
				<div class="hidden lg:flex">
					<EvalBar evalCp={tree.currentEvalCp} />
				</div>
			{/if}
			<div class="w-full max-w-[560px]">
				<Chessboard
					fen={tree.currentFen}
					{orientation}
					lastMove={tree.currentLastMove}
					autoShapes={hasEvals ? tree.bestMoveShapes : []}
					check={tree.currentCheck}
				/>
				<!-- Controls under board on mobile -->
				<div class="mt-3 flex justify-center lg:hidden">
					<BoardControls
						canGoBack={tree.canGoBack}
						canGoForward={tree.canGoForward}
						onFirst={tree.goToStart}
						onPrev={tree.goBack}
						onNext={tree.goForward}
						onLast={tree.goToEnd}
						onFlip={flipBoard}
					/>
				</div>
			</div>
		</div>

		<!-- Side panel -->
		<div class="flex min-w-0 flex-1 flex-col gap-3">
			<!-- Controls (desktop only) -->
			<div class="hidden lg:block">
				<BoardControls
					canGoBack={tree.canGoBack}
					canGoForward={tree.canGoForward}
					onFirst={tree.goToStart}
					onPrev={tree.goBack}
					onNext={tree.goForward}
					onLast={tree.goToEnd}
					onFlip={flipBoard}
				/>
			</div>
			<MoveList
				moves={tree.moves}
				currentPly={tree.currentPly}
				onSelectPly={tree.goToPly}
			/>
		</div>
	</div>
{/if}
