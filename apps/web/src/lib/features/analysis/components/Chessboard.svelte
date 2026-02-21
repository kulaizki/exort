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
		width: 100%;
		position: relative;
		padding-bottom: 100%; /* 1:1 aspect ratio */
	}

	.cg-wrap {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* Dark-theme board — light squares as bg-color, dark squares via SVG overlay */
	.chessboard-wrap :global(cg-board) {
		background-color: #6b6456;
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOng9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyI+PGcgaWQ9ImEiPjxnIGlkPSJiIj48ZyBpZD0iYyI+PGcgaWQ9ImQiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGlkPSJlIiBvcGFjaXR5PSIwIi8+PHVzZSB4PSIxIiB5PSIxIiBocmVmPSIjZSIgeDpocmVmPSIjZSIvPjxyZWN0IHk9IjEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGlkPSJmIiBvcGFjaXR5PSIwLjM4Ii8+PHVzZSB4PSIxIiB5PSItMSIgaHJlZj0iI2YiIHg6aHJlZj0iI2YiLz48L2c+PHVzZSB4PSIyIiBocmVmPSIjZCIgeDpocmVmPSIjZCIvPjwvZz48dXNlIHg9IjQiIGhyZWY9IiNjIiB4OmhyZWY9IiNjIi8+PC9nPjx1c2UgeT0iMiIgaHJlZj0iI2IiIHg6aHJlZj0iI2IiLz48L2c+PHVzZSB5PSI0IiBocmVmPSIjYSIgeDpocmVmPSIjYSIvPjwvc3ZnPgo=');
	}

	/* Last-move highlight (gold tinted) */
	.chessboard-wrap :global(cg-board square.last-move) {
		background-color: rgba(255, 184, 0, 0.41) !important;
	}

	/* Check highlight */
	.chessboard-wrap :global(cg-board square.check) {
		background: radial-gradient(
			ellipse at center,
			rgba(255, 0, 0, 1) 0%,
			rgba(231, 0, 0, 1) 25%,
			rgba(169, 0, 0, 0) 89%,
			rgba(158, 0, 0, 0) 100%
		) !important;
	}

	/* Selected square */
	.chessboard-wrap :global(cg-board square.selected) {
		background-color: rgba(255, 184, 0, 0.5) !important;
	}

	/* Coordinate labels */
	.chessboard-wrap :global(.cg-wrap coords) {
		color: #888;
		font-size: 10px;
	}
</style>
