def classify_move(centipawn_loss: float) -> str:
    if centipawn_loss > 300:
        return "BLUNDER"
    if centipawn_loss > 100:
        return "MISTAKE"
    if centipawn_loss > 50:
        return "INACCURACY"
    if centipawn_loss > 20:
        return "GOOD"
    if centipawn_loss > 5:
        return "EXCELLENT"
    return "BRILLIANT"
