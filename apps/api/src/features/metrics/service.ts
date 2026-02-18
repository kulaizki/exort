import { prisma } from '../../lib/prisma.js';

export class MetricsService {
  static async getSummary(userId: string) {
    const games = await prisma.game.findMany({
      where: { userId },
      include: { metrics: true }
    });

    const analyzed = games.filter((g) => g.metrics);
    const totalGames = games.length;
    const avgAccuracy = analyzed.length
      ? analyzed.reduce((sum, g) => sum + (g.metrics?.accuracy ?? 0), 0) / analyzed.length
      : 0;
    const avgBlunders = analyzed.length
      ? analyzed.reduce((sum, g) => sum + (g.metrics?.blunderCount ?? 0), 0) / analyzed.length
      : 0;
    const avgMistakes = analyzed.length
      ? analyzed.reduce((sum, g) => sum + (g.metrics?.mistakeCount ?? 0), 0) / analyzed.length
      : 0;
    const avgInaccuracies = analyzed.length
      ? analyzed.reduce((sum, g) => sum + (g.metrics?.inaccuracyCount ?? 0), 0) / analyzed.length
      : 0;

    const openingBreakdown: Record<string, { count: number; wins: number }> = {};
    for (const game of analyzed) {
      const name = game.metrics?.openingName ?? 'Unknown';
      if (!openingBreakdown[name]) openingBreakdown[name] = { count: 0, wins: 0 };
      openingBreakdown[name].count++;
      if (game.result === 'win') openingBreakdown[name].wins++;
    }

    return {
      totalGames,
      analyzedGames: analyzed.length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgBlunders: Math.round(avgBlunders * 10) / 10,
      avgMistakes: Math.round(avgMistakes * 10) / 10,
      avgInaccuracies: Math.round(avgInaccuracies * 10) / 10,
      openingBreakdown
    };
  }

  static async getTrends(userId: string) {
    const games = await prisma.game.findMany({
      where: { userId },
      include: { metrics: true },
      orderBy: { playedAt: 'asc' }
    });

    return games
      .filter((g) => g.metrics)
      .map((g) => ({
        date: g.playedAt,
        accuracy: g.metrics!.accuracy,
        blunders: g.metrics!.blunderCount,
        mistakes: g.metrics!.mistakeCount,
        timeControl: g.timeControl
      }));
  }
}
