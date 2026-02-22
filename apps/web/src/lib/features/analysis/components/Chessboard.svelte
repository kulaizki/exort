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

	/* Board colors — matches Lichess brown theme */
	.chessboard-wrap :global(cg-board) {
		background-color: #f0d9b5;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' shape-rendering='crispEdges'%3E%3Cg id='a'%3E%3Cg id='b'%3E%3Cg id='c'%3E%3Cg id='d'%3E%3Crect width='1' height='1' fill='%23f0d9b5'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23f0d9b5'/%3E%3Crect y='1' width='1' height='1' fill='%23b58863'/%3E%3Crect x='1' width='1' height='1' fill='%23b58863'/%3E%3C/g%3E%3Cuse x='2' href='%23d'/%3E%3C/g%3E%3Cuse x='4' href='%23c'/%3E%3C/g%3E%3Cuse y='2' href='%23b'/%3E%3C/g%3E%3Cuse y='4' href='%23a'/%3E%3C/svg%3E");
	}

	/* Last-move highlight (Lichess yellow-green) */
	.chessboard-wrap :global(cg-board square.last-move) {
		background-color: rgba(155, 199, 0, 0.41) !important;
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
		color: #6b5839;
		font-size: 10px;
	}
</style>
