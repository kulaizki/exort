<script lang="ts">
	import { untrack } from 'svelte';
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

	// Cache the tree so invalidateAll() doesn't recreate it when pgn content is unchanged
	let lastPgn = '';
	let lastEvalsJson = '';
	let result = $state<{ tree: ReturnType<typeof createGameTree>; error: null } | { tree: null; error: string }>({ tree: null, error: 'Loading' });

	$effect(() => {
		const currentPgn = pgn;
		const currentEvalsJson = JSON.stringify(moveEvaluations ?? []);
		untrack(() => {
			if (currentPgn === lastPgn && currentEvalsJson === lastEvalsJson) return;
			lastPgn = currentPgn;
			lastEvalsJson = currentEvalsJson;
			try {
				const tree = createGameTree(currentPgn, moveEvaluations);
				result = { tree, error: null };
			} catch (e) {
				const message = e instanceof Error ? e.message : 'Failed to parse game';
				result = { tree: null, error: message };
			}
		});
	});

	let flipped = $state(false);
	let playing = $state(false);
	const orientation = $derived<'white' | 'black'>(flipped ? (color === 'white' ? 'black' : 'white') : color);

	function flipBoard() {
		flipped = !flipped;
	}

	let playInterval: ReturnType<typeof setInterval> | null = null;

	function startAutoPlay() {
		stopAutoPlay();
		playInterval = setInterval(() => {
			const tree = result.tree;
			if (tree && tree.canGoForward) {
				tree.goForward();
			} else {
				playing = false;
			}
		}, 1000);
	}

	function stopAutoPlay() {
		if (playInterval) {
			clearInterval(playInterval);
			playInterval = null;
		}
	}

	function togglePlay() {
		playing = !playing;
		if (playing) {
			startAutoPlay();
		} else {
			stopAutoPlay();
		}
	}

	$effect(() => {
		return () => stopAutoPlay();
	});

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
	<div class="flex flex-col gap-4 lg:h-[560px] lg:flex-row lg:items-stretch lg:gap-6">
		<!-- Eval bar (desktop only) -->
		{#if hasEvals}
			<div class="hidden shrink-0 lg:block">
				<EvalBar evalCp={tree.currentEvalCp} />
			</div>
		{/if}

		<!-- Board column -->
		<div class="w-full shrink-0 lg:w-[560px]">
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
					isPlaying={playing}
					onFirst={tree.goToStart}
					onPrev={tree.goBack}
					onNext={tree.goForward}
					onLast={tree.goToEnd}
					onFlip={flipBoard}
					onTogglePlay={togglePlay}
				/>
			</div>
		</div>

		<!-- Side panel -->
		<div class="flex min-w-0 flex-1 flex-col gap-3 lg:overflow-hidden">
			<MoveList
				moves={tree.moves}
				currentPly={tree.currentPly}
				onSelectPly={tree.goToPly}
			/>
			<!-- Controls (desktop only) -->
			<div class="hidden justify-center lg:flex">
				<BoardControls
					canGoBack={tree.canGoBack}
					canGoForward={tree.canGoForward}
					isPlaying={playing}
					onFirst={tree.goToStart}
					onPrev={tree.goBack}
					onNext={tree.goForward}
					onLast={tree.goToEnd}
					onFlip={flipBoard}
					onTogglePlay={togglePlay}
				/>
			</div>
		</div>
	</div>
{/if}
