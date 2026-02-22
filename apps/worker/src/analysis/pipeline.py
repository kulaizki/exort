import io
from dataclasses import dataclass, field

import chess
import chess.pgn
from stockfish import Stockfish

from src.config import ANALYSIS_NODES, ANALYSIS_DEPTH, STOCKFISH_PATH, STOCKFISH_THREADS, STOCKFISH_HASH_MB
from src.analysis.classifier import classify_move
from src.analysis.accuracy import calculate_accuracy
from src.analysis.phase import aggregate_phase_errors


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


def _cp_from_info(info: dict) -> int | None:
    if info is None:
        return None
    eval_type = info.get("type")
    value = info.get("value")
    if eval_type == "mate" and value is not None:
        return 10000 if value > 0 else -10000
    if eval_type == "cp" and value is not None:
        return value
    return None


def _cp_from_top(top: list[dict]) -> int | None:
    if not top:
        return None
    entry = top[0]
    mate = entry.get("Mate")
    if mate is not None:
        return 10000 if mate > 0 else -10000
    return entry.get("Centipawn")


def analyze_game(pgn: str, game_id: str) -> AnalysisResult:
    game = chess.pgn.read_game(io.StringIO(pgn))
    if game is None:
        raise ValueError(f"Failed to parse PGN for game {game_id}")

    headers = game.headers
    opening_name = headers.get("Opening") or headers.get("Variant") or None
    opening_eco = headers.get("ECO") or None

    sf = Stockfish(
        path=STOCKFISH_PATH,
        depth=ANALYSIS_DEPTH if ANALYSIS_DEPTH > 0 else 18,
        parameters={"Threads": STOCKFISH_THREADS, "Hash": STOCKFISH_HASH_MB},
    )

    move_evals: list[MoveEval] = []
    board = game.board()
    total_moves_node = game.end()
    total_plies = total_moves_node.ply()
    total_moves = (total_plies + 1) // 2

    node = game
    while not node.is_end():
        next_node = node.variation(0)
        played_move = next_node.move

        sf.set_fen_position(board.fen())
        top = sf.get_top_moves(1, num_nodes=ANALYSIS_NODES)
        before_cp = _cp_from_top(top) or 0
        best_move_result = top[0]["Move"] if top else None

        board.push(played_move)

        sf.set_fen_position(board.fen())
        after_top = sf.get_top_moves(1, num_nodes=ANALYSIS_NODES)
        after_cp = _cp_from_top(after_top) or 0

        ply = next_node.ply()
        move_number = (ply + 1) // 2
        color = "white" if board.turn == chess.BLACK else "black"

        if color == "white":
            cp_loss = max(0, before_cp - after_cp)
            eval_cp = after_cp
        else:
            cp_loss = max(0, after_cp - before_cp)
            eval_cp = after_cp

        classification = classify_move(float(cp_loss))

        move_evals.append(MoveEval(
            move_number=move_number,
            color=color,
            eval_cp=eval_cp,
            cp_loss=cp_loss,
            best_move_uci=best_move_result,
            played_move_uci=played_move.uci(),
            classification=classification,
        ))

        node = next_node

    del sf

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
