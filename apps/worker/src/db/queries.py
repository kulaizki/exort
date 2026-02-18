import json
import uuid

from src.db.connection import get_connection
from src.analysis.pipeline import GameMetrics, MoveEval


def claim_pending_jobs(limit: int) -> list[dict]:
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, "gameId"
                    FROM analysis_job
                    WHERE status = 'PENDING'
                    ORDER BY "createdAt" ASC
                    LIMIT %s
                    FOR UPDATE SKIP LOCKED
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
                if not rows:
                    return []
                ids = [r[0] for r in rows]
                cur.execute(
                    """
                    UPDATE analysis_job
                    SET status = 'PROCESSING', "startedAt" = now()
                    WHERE id = ANY(%s)
                    """,
                    (ids,),
                )
                return [{"id": r[0], "game_id": r[1]} for r in rows]
    finally:
        conn.close()


def get_game_pgn(game_id: str) -> str:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT pgn FROM game WHERE id = %s', (game_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Game not found: {game_id}")
            return row[0]
    finally:
        conn.close()


def save_analysis(
    game_id: str,
    job_id: str,
    metrics: GameMetrics,
    moves: list[MoveEval],
) -> None:
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                metric_id = str(uuid.uuid4())
                cur.execute(
                    """
                    INSERT INTO game_metric (
                        id, "gameId", "centipawnLoss", accuracy,
                        "blunderCount", "mistakeCount", "inaccuracyCount",
                        "openingName", "openingEco", "phaseErrors"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT ("gameId") DO UPDATE SET
                        "centipawnLoss"   = EXCLUDED."centipawnLoss",
                        accuracy          = EXCLUDED.accuracy,
                        "blunderCount"    = EXCLUDED."blunderCount",
                        "mistakeCount"    = EXCLUDED."mistakeCount",
                        "inaccuracyCount" = EXCLUDED."inaccuracyCount",
                        "openingName"     = EXCLUDED."openingName",
                        "openingEco"      = EXCLUDED."openingEco",
                        "phaseErrors"     = EXCLUDED."phaseErrors"
                    """,
                    (
                        metric_id,
                        game_id,
                        metrics.centipawn_loss,
                        metrics.accuracy,
                        metrics.blunder_count,
                        metrics.mistake_count,
                        metrics.inaccuracy_count,
                        metrics.opening_name,
                        metrics.opening_eco,
                        json.dumps(metrics.phase_errors),
                    ),
                )

                cur.execute(
                    'DELETE FROM move_evaluation WHERE "gameId" = %s',
                    (game_id,),
                )

                move_rows = [
                    (
                        str(uuid.uuid4()),
                        game_id,
                        m.move_number,
                        m.color,
                        m.eval_cp,
                        m.best_move_uci,
                        m.played_move_uci,
                        m.classification,
                    )
                    for m in moves
                ]
                cur.executemany(
                    """
                    INSERT INTO move_evaluation (
                        id, "gameId", "moveNumber", color, "evalCp",
                        "bestMoveUci", "playedMoveUci", classification
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    move_rows,
                )

                cur.execute(
                    """
                    UPDATE analysis_job
                    SET status = 'COMPLETED', "completedAt" = now()
                    WHERE id = %s
                    """,
                    (job_id,),
                )
    finally:
        conn.close()


def mark_job_failed(job_id: str) -> None:
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE analysis_job
                    SET status = 'FAILED', "completedAt" = now()
                    WHERE id = %s
                    """,
                    (job_id,),
                )
    finally:
        conn.close()
