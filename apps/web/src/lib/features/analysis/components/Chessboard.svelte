<script lang="ts">
	import type { Api } from 'chessground/api';
	import type { DrawShape } from 'chessground/draw';
	import type { Color, Key } from 'chessground/types';

	const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	interface Props {
		fen?: string;
		orientation?: 'white' | 'black';
		lastMove?: [string, string] | undefined;
		autoShapes?: DrawShape[];
		check?: boolean;
	}

	let {
		fen = STARTING_FEN,
		orientation = 'white',
		lastMove = undefined,
		autoShapes = [],
		check = false
	}: Props = $props();

	let boardEl: HTMLElement | undefined = $state();
	let api: Api | undefined = $state();

	// Derive the turn color from FEN (the side to move is in check after a checking move)
	let turnColor: Color = $derived(fen.split(' ')[1] === 'b' ? 'black' : 'white');
	let checkColor: Color | false = $derived(check ? turnColor : false);
	let lastMoveKeys: Key[] | undefined = $derived(lastMove as Key[] | undefined);

	// Mount chessground (DOM-only, SSR-safe via dynamic import)
	$effect(() => {
		if (!boardEl) return;

		let destroyed = false;
		let localApi: Api | undefined;

		import('chessground').then(({ Chessground }) => {
			if (destroyed) return;

			localApi = Chessground(boardEl!, {
				fen,
				orientation,
				viewOnly: true,
				lastMove: lastMoveKeys,
				check: checkColor,
				coordinates: true,
				animation: { enabled: true, duration: 200 },
				highlight: { lastMove: true, check: true },
				drawable: { enabled: false, visible: true, autoShapes }
			});
			api = localApi;
		});

		return () => {
			destroyed = true;
			localApi?.destroy();
			api = undefined;
		};
	});

	// Reactive updates when props change
	$effect(() => {
		if (!api) return;

		api.set({
			fen,
			orientation,
			lastMove: lastMoveKeys,
			check: checkColor,
			drawable: { autoShapes }
		});
	});
</script>

<div class="chessboard-wrap">
	<div class="cg-wrap" bind:this={boardEl}></div>
</div>

<style>
	.chessboard-wrap {
		aspect-ratio: 1 / 1;
		width: 100%;
		position: relative;
	}

	.cg-wrap {
		width: 100%;
		height: 100%;
	}

	/* Dark-theme board squares */
	.chessboard-wrap :global(cg-board square.white) {
		background-color: #3d3d3d;
	}

	.chessboard-wrap :global(cg-board square.black) {
		background-color: #2a2a2a;
	}

	/* Last-move highlight (gold tinted) */
	.chessboard-wrap :global(cg-board square.last-move) {
		background-color: rgba(255, 184, 0, 0.15);
	}

	/* Check highlight (subtle red) */
	.chessboard-wrap :global(cg-board square.check) {
		background: radial-gradient(
			ellipse at center,
			rgba(255, 0, 0, 0.5) 0%,
			rgba(200, 0, 0, 0.25) 40%,
			rgba(150, 0, 0, 0) 70%
		);
	}

	/* Selected square */
	.chessboard-wrap :global(cg-board square.selected) {
		background-color: rgba(255, 184, 0, 0.3);
	}

	/* Coordinate labels */
	.chessboard-wrap :global(coords) {
		color: #666;
		font-size: 10px;
	}
</style>
