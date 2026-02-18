def detect_phase(move_number: int, total_moves: int) -> str:
    if move_number <= 15:
        return "opening"
    if move_number <= total_moves * 0.6:
        return "middlegame"
    return "endgame"


def aggregate_phase_errors(moves: list, total_moves: int) -> dict:
    result = {
        "opening": {"blunders": 0, "mistakes": 0, "inaccuracies": 0},
        "middlegame": {"blunders": 0, "mistakes": 0, "inaccuracies": 0},
        "endgame": {"blunders": 0, "mistakes": 0, "inaccuracies": 0},
    }
    error_classifications = {"BLUNDER", "MISTAKE", "INACCURACY"}
    for move in moves:
        if move.classification not in error_classifications:
            continue
        phase = detect_phase(move.move_number, total_moves)
        if move.classification == "BLUNDER":
            result[phase]["blunders"] += 1
        elif move.classification == "MISTAKE":
            result[phase]["mistakes"] += 1
        elif move.classification == "INACCURACY":
            result[phase]["inaccuracies"] += 1
    return result
