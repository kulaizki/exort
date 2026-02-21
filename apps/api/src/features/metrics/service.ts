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
    const avgCentipawnLoss = analyzed.length
      ? analyzed.reduce((sum, g) => sum + (g.metrics?.centipawnLoss ?? 0), 0) / analyzed.length
      : 0;

    // Opening breakdown (legacy)
    const openingBreakdown: Record<string, { count: number; wins: number }> = {};
    for (const game of analyzed) {
      const name = game.metrics?.openingName ?? 'Unknown';
      if (!openingBreakdown[name]) openingBreakdown[name] = { count: 0, wins: 0 };
      openingBreakdown[name].count++;
      if (game.result === 'win') openingBreakdown[name].wins++;
    }

    // Top openings with ECO codes
    const openingMap: Record<string, { name: string; eco: string; games: number; wins: number }> =
      {};
    for (const game of games) {
      const name = game.openingName ?? game.metrics?.openingName ?? 'Unknown';
      const eco = game.openingEco ?? game.metrics?.openingEco ?? '';
      const key = name;
      if (!openingMap[key]) openingMap[key] = { name, eco, games: 0, wins: 0 };
      openingMap[key].games++;
      if (game.result === 'win') openingMap[key].wins++;
    }
    const topOpenings = Object.values(openingMap)
      .sort((a, b) => b.games - a.games)
      .slice(0, 8)
      .map((o) => ({
        name: o.name,
        eco: o.eco,
        games: o.games,
        winRate: o.games > 0 ? Math.round((o.wins / o.games) * 100) : 0
      }));

    // Result distribution
    let wins = 0;
    let losses = 0;
    let draws = 0;
    for (const game of games) {
      if (game.result === 'win') wins++;
      else if (game.result === 'loss') losses++;
      else draws++;
    }

    // By time control
    const tcMap: Record<string, { games: number; accuracySum: number; cplSum: number; analyzed: number }> = {};
    for (const game of games) {
      const tc = game.timeControl || 'unknown';
      if (!tcMap[tc]) tcMap[tc] = { games: 0, accuracySum: 0, cplSum: 0, analyzed: 0 };
      tcMap[tc].games++;
      if (game.metrics) {
        tcMap[tc].accuracySum += game.metrics.accuracy;
        tcMap[tc].cplSum += game.metrics.centipawnLoss;
        tcMap[tc].analyzed++;
      }
    }
    const byTimeControl: Record<string, { games: number; accuracy: number; avgCpl: number }> = {};
    for (const [tc, data] of Object.entries(tcMap)) {
      byTimeControl[tc] = {
        games: data.games,
        accuracy: data.analyzed > 0 ? Math.round((data.accuracySum / data.analyzed) * 10) / 10 : 0,
        avgCpl: data.analyzed > 0 ? Math.round((data.cplSum / data.analyzed) * 10) / 10 : 0
      };
    }

    // By color
    const colorMap = { white: { games: 0, accuracySum: 0, wins: 0, analyzed: 0 }, black: { games: 0, accuracySum: 0, wins: 0, analyzed: 0 } };
    for (const game of games) {
      const c = game.color === 'white' ? 'white' : 'black';
      colorMap[c].games++;
      if (game.result === 'win') colorMap[c].wins++;
      if (game.metrics) {
        colorMap[c].accuracySum += game.metrics.accuracy;
        colorMap[c].analyzed++;
      }
    }
    const byColor = {
      white: {
        games: colorMap.white.games,
        accuracy: colorMap.white.analyzed > 0 ? Math.round((colorMap.white.accuracySum / colorMap.white.analyzed) * 10) / 10 : 0,
        winRate: colorMap.white.games > 0 ? Math.round((colorMap.white.wins / colorMap.white.games) * 100) : 0
      },
      black: {
        games: colorMap.black.games,
        accuracy: colorMap.black.analyzed > 0 ? Math.round((colorMap.black.accuracySum / colorMap.black.analyzed) * 10) / 10 : 0,
        winRate: colorMap.black.games > 0 ? Math.round((colorMap.black.wins / colorMap.black.games) * 100) : 0
      }
    };

    return {
      totalGames,
      analyzedGames: analyzed.length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgBlunders: Math.round(avgBlunders * 10) / 10,
      avgMistakes: Math.round(avgMistakes * 10) / 10,
      avgInaccuracies: Math.round(avgInaccuracies * 10) / 10,
      avgCentipawnLoss: Math.round(avgCentipawnLoss * 10) / 10,
      openingBreakdown,
      topOpenings,
      resultDistribution: { wins, losses, draws },
      byTimeControl,
      byColor
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
        inaccuracies: g.metrics!.inaccuracyCount,
        centipawnLoss: g.metrics!.centipawnLoss,
        result: g.result,
        playerRating: g.playerRating,
        timeControl: g.timeControl
      }));
  }
}
