import signal
import time

from src.config import MAX_CONCURRENT, POLL_INTERVAL
from src.analysis.pipeline import analyze_game
from src.db.queries import claim_pending_jobs, get_game_pgn, save_analysis, mark_job_failed

_running = True


def _handle_signal(signum, frame):
    global _running
    print(f"Received signal {signum}, shutting down gracefully...")
    _running = False


def process_job(job: dict) -> None:
    job_id = job["id"]
    game_id = job["game_id"]
    print(f"Processing job {job_id} for game {game_id}")
    pgn = get_game_pgn(game_id)
    result = analyze_game(pgn, game_id)
    save_analysis(game_id, job_id, result.metrics, result.moves)
    print(f"Completed job {job_id}")


def main() -> None:
    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    print("Worker started")

    while _running:
        jobs = claim_pending_jobs(MAX_CONCURRENT)

        if not jobs:
            time.sleep(POLL_INTERVAL)
            continue

        for job in jobs:
            if not _running:
                break
            try:
                process_job(job)
            except Exception as exc:
                print(f"Job {job['id']} failed: {exc}")
                mark_job_failed(job["id"])

    print("Worker stopped")


if __name__ == "__main__":
    main()
