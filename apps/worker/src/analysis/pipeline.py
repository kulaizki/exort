import io
from dataclasses import dataclass, field

import chess
import chess.engine
import chess.pgn

from src.config import (
    ANALYSIS_DEPTH,
    ANALYSIS_NODES,
    STOCKFISH_HASH_MB,
    STOCKFISH_PATH,
    STOCKFISH_THREADS,
)
from src.analysis.classifier import classify_move
from src.analysis.accuracy import calculate_accuracy
from src.analysis.phase import aggregate_phase_errors


MATE_SCORE = 10000
DEFAULT_DEPTH = 18


@dataclass
class MoveEval:
    move_number: int
    color: str
    eval_cp: int
    cp_loss: int
    best_move_uci: str | None
    played_move_uci: str
    classification: str


@dataclass
class GameMetrics:
    centipawn_loss: float
    accuracy: float
    blunder_count: int
    mistake_count: int
    inaccuracy_count: int
    opening_name: str | None
    opening_eco: str | None
    phase_errors: dict


@dataclass
class AnalysisResult:
    metrics: GameMetrics
    moves: list[MoveEval] = field(default_factory=list)


def _build_limit() -> chess.engine.Limit:
    kwargs: dict = {}
    if ANALYSIS_NODES > 0:
        kwargs["nodes"] = ANALYSIS_NODES
    if ANALYSIS_DEPTH > 0:
        kwargs["depth"] = ANALYSIS_DEPTH
    if not kwargs:
        kwargs["depth"] = DEFAULT_DEPTH
    return chess.engine.Limit(**kwargs)


def _info_to_cp(info: chess.engine.InfoDict) -> int:
    score = info.get("score")
    if score is None:
        return 0
    return score.white().score(mate_score=MATE_SCORE)


def _info_to_best_uci(info: chess.engine.InfoDict) -> str | None:
    pv = info.get("pv")
    if pv:
        return pv[0].uci()
    return None


def _terminal_cp(board: chess.Board, mover_was_white: bool) -> int:
    if board.is_checkmate():
        return MATE_SCORE if mover_was_white else -MATE_SCORE
    return 0


def analyze_game(pgn: str, game_id: str) -> AnalysisResult:
    game = chess.pgn.read_game(io.StringIO(pgn))
    if game is None:
        raise ValueError(f"Failed to parse PGN for game {game_id}")

    headers = game.headers
    opening_name = headers.get("Opening") or headers.get("Variant") or None
    opening_eco = headers.get("ECO") or None

    limit = _build_limit()
    engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
    move_evals: list[MoveEval] = []

    try:
        engine.configure({"Threads": STOCKFISH_THREADS, "Hash": STOCKFISH_HASH_MB})

        board = game.board()
        total_plies = game.end().ply()
        total_moves = (total_plies + 1) // 2

        before_info = engine.analyse(board, limit)
        before_cp = _info_to_cp(before_info)
        best_move_uci = _info_to_best_uci(before_info)

        node = game
        while not node.is_end():
            next_node = node.variation(0)
            played_move = next_node.move
            mover_was_white = board.turn == chess.WHITE

            board.push(played_move)

            if board.is_game_over(claim_draw=False):
                after_cp = _terminal_cp(board, mover_was_white)
                next_best_uci = None
            else:
                after_info = engine.analyse(board, limit)
                after_cp = _info_to_cp(after_info)
                next_best_uci = _info_to_best_uci(after_info)

            if mover_was_white:
                cp_loss = max(0, before_cp - after_cp)
            else:
                cp_loss = max(0, after_cp - before_cp)

            ply = next_node.ply()
            move_number = (ply + 1) // 2
            color = "white" if mover_was_white else "black"

            move_evals.append(MoveEval(
                move_number=move_number,
                color=color,
                eval_cp=after_cp,
                cp_loss=cp_loss,
                best_move_uci=best_move_uci,
                played_move_uci=played_move.uci(),
                classification=classify_move(float(cp_loss)),
            ))

            before_cp = after_cp
            best_move_uci = next_best_uci
            node = next_node
    finally:
        engine.quit()

    cp_losses = [m.cp_loss for m in move_evals]
    accuracy = calculate_accuracy(cp_losses)
    avg_cp_loss = round(sum(cp_losses) / len(cp_losses), 2) if cp_losses else 0.0

    blunder_count = sum(1 for m in move_evals if m.classification == "BLUNDER")
    mistake_count = sum(1 for m in move_evals if m.classification == "MISTAKE")
    inaccuracy_count = sum(1 for m in move_evals if m.classification == "INACCURACY")

    phase_errors = aggregate_phase_errors(move_evals, total_moves)

    metrics = GameMetrics(
        centipawn_loss=avg_cp_loss,
        accuracy=accuracy,
        blunder_count=blunder_count,
        mistake_count=mistake_count,
        inaccuracy_count=inaccuracy_count,
        opening_name=opening_name,
        opening_eco=opening_eco,
        phase_errors=phase_errors,
    )

    return AnalysisResult(metrics=metrics, moves=move_evals)
