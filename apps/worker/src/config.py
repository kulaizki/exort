import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
STOCKFISH_PATH = os.environ.get("STOCKFISH_PATH", "/usr/games/stockfish")
ANALYSIS_DEPTH = int(os.environ.get("ANALYSIS_DEPTH", "20"))
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "5"))
MAX_CONCURRENT = int(os.environ.get("MAX_CONCURRENT", "2"))
TIME_LIMIT_PER_GAME = int(os.environ.get("TIME_LIMIT_PER_GAME", "300"))
