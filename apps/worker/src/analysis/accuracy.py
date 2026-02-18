def win_probability(cp: float) -> float:
    return 50 + 50 * (2 / (1 + 10 ** (-cp / 400)) - 1)


def calculate_accuracy(centipawn_losses: list[float]) -> float:
    if not centipawn_losses:
        return 0.0
    accuracies = []
    for loss in centipawn_losses:
        accuracy = max(0, 103.1668 * (2 ** (-0.04354 * loss)) - 3.1668)
        accuracies.append(accuracy)
    return round(sum(accuracies) / len(accuracies), 1)
