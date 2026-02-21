import { Chess } from 'chessops';
import { parsePgn, startingPosition } from 'chessops/pgn';
import { makeFen } from 'chessops/fen';
import { parseSan, makeSan } from 'chessops/san';
import { parseUci, makeSquare } from 'chessops';
import type { Square } from 'chessops';

export interface MoveEvaluation {
	id: string;
	moveNumber: number;
	color: string;
	playedMoveUci: string;
	bestMoveUci: string | null;
	evalCp: number;
	classification: string;
}

export interface ProcessedMove {
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

export function createGameTree(pgn: string, moveEvaluations?: MoveEvaluation[]) {
	const games = parsePgn(pgn);
	if (!games.length) throw new Error('Invalid PGN: no games found');

	const game = games[0];
	const posResult = startingPosition(game.headers);
	if (!posResult.isOk) throw new Error('Invalid PGN: cannot determine starting position');

	const startFen = makeFen(posResult.value.toSetup());
	const pos = posResult.value;

	// Build eval lookup: "moveNumber-color" → evaluation
	const evalMap = new Map<string, MoveEvaluation>();
	if (moveEvaluations) {
		for (const ev of moveEvaluations) {
			evalMap.set(`${ev.moveNumber}-${ev.color}`, ev);
		}
	}

	// Walk mainline and build processed moves
	const moves: ProcessedMove[] = [];
	let ply = 0;

	for (const node of game.moves.mainline()) {
		ply++;
		const color: 'white' | 'black' = pos.turn;
		const moveNumber = Math.ceil(ply / 2);

		const move = parseSan(pos, node.san);
		if (!move) break;

		const san = makeSan(pos, move);

		// Extract from/to squares for last-move highlight
		let lastMove: [string, string] | undefined;
		if ('from' in move) {
			lastMove = [makeSquare(move.from as Square), makeSquare(move.to as Square)];
		}

		pos.play(move);
		const fen = makeFen(pos.toSetup());
		const isCheck = pos.isCheck();

		// Match evaluation
		const ev = evalMap.get(`${moveNumber}-${color}`);

		moves.push({
			ply,
			san,
			moveNumber,
			color,
			fen,
			lastMove,
			isCheck,
			evalCp: ev?.evalCp ?? null,
			bestMoveUci: ev?.bestMoveUci ?? null,
			classification: ev?.classification ?? null
		});
	}

	// Reactive state
	let currentPly = $state(0);

	const currentMove = $derived(currentPly > 0 ? moves[currentPly - 1] : null);
	const currentFen = $derived(currentMove?.fen ?? startFen);
	const currentLastMove = $derived(currentMove?.lastMove);
	const currentCheck = $derived(currentMove?.isCheck ?? false);
	const currentEvalCp = $derived(currentMove?.evalCp ?? null);
	const currentClassification = $derived(currentMove?.classification ?? null);

	const bestMoveShapes = $derived.by(() => {
		if (!currentMove?.bestMoveUci) return [];
		const uci = currentMove.bestMoveUci;
		const parsed = parseUci(uci);
		if (!parsed || !('from' in parsed)) return [];
		return [
			{
				orig: makeSquare(parsed.from as Square),
				dest: makeSquare(parsed.to as Square),
				brush: 'green'
			}
		];
	});

	const totalPly = moves.length;
	const canGoForward = $derived(currentPly < totalPly);
	const canGoBack = $derived(currentPly > 0);

	function goForward() {
		if (currentPly < totalPly) currentPly++;
	}

	function goBack() {
		if (currentPly > 0) currentPly--;
	}

	function goToStart() {
		currentPly = 0;
	}

	function goToEnd() {
		currentPly = totalPly;
	}

	function goToPly(ply: number) {
		if (ply >= 0 && ply <= totalPly) currentPly = ply;
	}

	return {
		moves,
		totalPly,
		get currentPly() {
			return currentPly;
		},
		get currentMove() {
			return currentMove;
		},
		get currentFen() {
			return currentFen;
		},
		get currentLastMove() {
			return currentLastMove;
		},
		get currentCheck() {
			return currentCheck;
		},
		get currentEvalCp() {
			return currentEvalCp;
		},
		get currentClassification() {
			return currentClassification;
		},
		get bestMoveShapes() {
			return bestMoveShapes;
		},
		get canGoForward() {
			return canGoForward;
		},
		get canGoBack() {
			return canGoBack;
		},
		goForward,
		goBack,
		goToStart,
		goToEnd,
		goToPly
	};
}
