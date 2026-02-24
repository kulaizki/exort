import { prisma } from '../../lib/prisma.js';

interface PerformanceSummaryArgs {
  timeControl?: string;
  days?: number;
}

interface RecentGamesArgs {
  limit?: number;
  timeControl?: string;
  result?: string;
}

interface GameAnalysisArgs {
  gameId?: string;
}

interface OpeningStatsArgs {
  color?: string;
  limit?: number;
}

interface WeaknessReportArgs {
  days?: number;
}

interface RatingHistoryArgs {
  timeControl?: string;
  limit?: number;
}

export class ToolHandlers {
  static async getPerformanceSummary(userId: string, args: PerformanceSummaryArgs) {
    const days = args.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = { userId, playedAt: { gte: since } };
    if (args.timeControl) where.timeControl = args.timeControl;

    const games = await prisma.game.findMany({
      where,
      include: { metrics: true },
      orderBy: { playedAt: 'desc' }
    });

    const analyzed = games.filter((g) => g.metrics);
    const total = games.length;
    if (total === 0) return { totalGames: 0, message: 'No games found for this period.' };

    const avgAccuracy = analyzed.length
      ? Math.round(
          (analyzed.reduce((s, g) => s + (g.metrics?.accuracy ?? 0), 0) / analyzed.length) * 10
        ) / 10
      : 0;
    const avgBlunders = analyzed.length
      ? Math.round(
          (analyzed.reduce((s, g) => s + (g.metrics?.blunderCount ?? 0), 0) / analyzed.length) * 10
        ) / 10
      : 0;
    const avgMistakes = analyzed.length
      ? Math.round(
          (analyzed.reduce((s, g) => s + (g.metrics?.mistakeCount ?? 0), 0) / analyzed.length) * 10
        ) / 10
      : 0;

    let wins = 0,
      losses = 0,
      draws = 0;
    for (const g of games) {
      if (g.result === 'win') wins++;
      else if (g.result === 'loss') losses++;
      else draws++;
    }

    // By color
    const colorStats = { white: { games: 0, wins: 0, accSum: 0, accCount: 0 }, black: { games: 0, wins: 0, accSum: 0, accCount: 0 } };
    for (const g of games) {
      const c = g.color === 'white' ? 'white' : 'black';
      colorStats[c].games++;
      if (g.result === 'win') colorStats[c].wins++;
      if (g.metrics) {
        colorStats[c].accSum += g.metrics.accuracy;
        colorStats[c].accCount++;
      }
    }

    // Top openings
    const openingMap: Record<string, { games: number; wins: number; accSum: number; accCount: number }> = {};
    for (const g of games) {
      const name = g.openingName ?? 'Unknown';
      if (!openingMap[name]) openingMap[name] = { games: 0, wins: 0, accSum: 0, accCount: 0 };
      openingMap[name].games++;
      if (g.result === 'win') openingMap[name].wins++;
      if (g.metrics) {
        openingMap[name].accSum += g.metrics.accuracy;
        openingMap[name].accCount++;
      }
    }
    const topOpenings = Object.entries(openingMap)
      .sort(([, a], [, b]) => b.games - a.games)
      .slice(0, 5)
      .map(([name, d]) => ({
        name,
        games: d.games,
        winRate: Math.round((d.wins / d.games) * 100),
        avgAccuracy: d.accCount ? Math.round((d.accSum / d.accCount) * 10) / 10 : null
      }));

    return {
      totalGames: total,
      analyzedGames: analyzed.length,
      days,
      avgAccuracy,
      avgBlunders,
      avgMistakes,
      results: { wins, losses, draws, winRate: Math.round((wins / total) * 100) },
      byColor: {
        white: {
          games: colorStats.white.games,
          winRate: colorStats.white.games ? Math.round((colorStats.white.wins / colorStats.white.games) * 100) : 0,
          avgAccuracy: colorStats.white.accCount ? Math.round((colorStats.white.accSum / colorStats.white.accCount) * 10) / 10 : null
        },
        black: {
          games: colorStats.black.games,
          winRate: colorStats.black.games ? Math.round((colorStats.black.wins / colorStats.black.games) * 100) : 0,
          avgAccuracy: colorStats.black.accCount ? Math.round((colorStats.black.accSum / colorStats.black.accCount) * 10) / 10 : null
        }
      },
      topOpenings
    };
  }

  static async getRecentGames(userId: string, args: RecentGamesArgs) {
    const limit = Math.min(args.limit ?? 10, 20);

    const where: Record<string, unknown> = { userId };
    if (args.timeControl) where.timeControl = args.timeControl;
    if (args.result) where.result = args.result;

    const games = await prisma.game.findMany({
      where,
      include: { metrics: true },
      orderBy: { playedAt: 'desc' },
      take: limit
    });

    return games.map((g) => ({
      id: g.id,
      opponent: g.opponent,
      color: g.color,
      result: g.result,
      timeControl: g.timeControl,
      playedAt: g.playedAt,
      playerRating: g.playerRating,
      opponentRating: g.opponentRating,
      opening: g.openingName,
      accuracy: g.metrics?.accuracy ?? null,
      blunders: g.metrics?.blunderCount ?? null,
      mistakes: g.metrics?.mistakeCount ?? null
    }));
  }

  static async getGameAnalysis(userId: string, args: GameAnalysisArgs) {
    if (!args.gameId) return { error: 'No game ID provided.' };

    const game = await prisma.game.findFirst({
      where: { id: args.gameId, userId },
      include: { metrics: true }
    });
    if (!game) return { error: 'Game not found.' };

    // Only fetch key moves (blunders, mistakes, inaccuracies, brilliancies)
    const keyMoves = await prisma.moveEvaluation.findMany({
      where: {
        gameId: game.id,
        classification: { in: ['BLUNDER', 'MISTAKE', 'INACCURACY', 'BRILLIANT'] }
      },
      orderBy: { moveNumber: 'asc' }
    });

    return {
      id: game.id,
      opponent: game.opponent,
      color: game.color,
      result: game.result,
      timeControl: game.timeControl,
      playedAt: game.playedAt,
      playerRating: game.playerRating,
      opponentRating: game.opponentRating,
      opening: game.openingName,
      openingEco: game.openingEco,
      metrics: game.metrics
        ? {
            accuracy: game.metrics.accuracy,
            centipawnLoss: game.metrics.centipawnLoss,
            blunders: game.metrics.blunderCount,
            mistakes: game.metrics.mistakeCount,
            inaccuracies: game.metrics.inaccuracyCount,
            phaseErrors: game.metrics.phaseErrors
          }
        : null,
      keyMoves: keyMoves.map((m) => ({
        moveNumber: m.moveNumber,
        color: m.color,
        classification: m.classification,
        played: m.playedMoveUci,
        best: m.bestMoveUci,
        evalCp: m.evalCp
      }))
    };
  }

  static async getOpeningStats(userId: string, args: OpeningStatsArgs) {
    const limit = Math.min(args.limit ?? 10, 10);

    const where: Record<string, unknown> = { userId };
    if (args.color) where.color = args.color;

    const games = await prisma.game.findMany({
      where,
      include: { metrics: true },
      orderBy: { playedAt: 'desc' }
    });

    const openingMap: Record<string, { games: number; wins: number; losses: number; draws: number; accSum: number; accCount: number }> = {};
    for (const g of games) {
      const name = g.openingName ?? 'Unknown';
      if (!openingMap[name])
        openingMap[name] = { games: 0, wins: 0, losses: 0, draws: 0, accSum: 0, accCount: 0 };
      openingMap[name].games++;
      if (g.result === 'win') openingMap[name].wins++;
      else if (g.result === 'loss') openingMap[name].losses++;
      else openingMap[name].draws++;
      if (g.metrics) {
        openingMap[name].accSum += g.metrics.accuracy;
        openingMap[name].accCount++;
      }
    }

    return Object.entries(openingMap)
      .sort(([, a], [, b]) => b.games - a.games)
      .slice(0, limit)
      .map(([name, d]) => ({
        name,
        games: d.games,
        winRate: Math.round((d.wins / d.games) * 100),
        drawRate: Math.round((d.draws / d.games) * 100),
        lossRate: Math.round((d.losses / d.games) * 100),
        avgAccuracy: d.accCount ? Math.round((d.accSum / d.accCount) * 10) / 10 : null
      }));
  }

  static async getWeaknessReport(userId: string, args: WeaknessReportArgs) {
    const days = args.days ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const games = await prisma.game.findMany({
      where: { userId, playedAt: { gte: since } },
      include: { metrics: true },
      orderBy: { playedAt: 'desc' }
    });

    const analyzed = games.filter((g) => g.metrics);
    if (analyzed.length === 0) return { message: 'No analyzed games found for this period.' };

    // Worst games by blunder count
    const worstGames = [...analyzed]
      .sort((a, b) => (b.metrics!.blunderCount - a.metrics!.blunderCount))
      .slice(0, 5)
      .map((g) => ({
        id: g.id,
        opponent: g.opponent,
        result: g.result,
        blunders: g.metrics!.blunderCount,
        accuracy: g.metrics!.accuracy,
        opening: g.openingName,
        playedAt: g.playedAt
      }));

    // Phase error averages
    let openingErr = 0, middlegameErr = 0, endgameErr = 0, phaseCount = 0;
    for (const g of analyzed) {
      const pe = g.metrics!.phaseErrors as Record<string, number> | null;
      if (pe) {
        openingErr += pe.opening ?? 0;
        middlegameErr += pe.middlegame ?? 0;
        endgameErr += pe.endgame ?? 0;
        phaseCount++;
      }
    }
    const phaseAverages = phaseCount
      ? {
          opening: Math.round((openingErr / phaseCount) * 10) / 10,
          middlegame: Math.round((middlegameErr / phaseCount) * 10) / 10,
          endgame: Math.round((endgameErr / phaseCount) * 10) / 10
        }
      : null;

    // Worst openings by accuracy (min 3 games)
    const openingMap: Record<string, { accSum: number; count: number }> = {};
    for (const g of analyzed) {
      const name = g.openingName ?? 'Unknown';
      if (!openingMap[name]) openingMap[name] = { accSum: 0, count: 0 };
      openingMap[name].accSum += g.metrics!.accuracy;
      openingMap[name].count++;
    }
    const worstOpenings = Object.entries(openingMap)
      .filter(([, d]) => d.count >= 3)
      .map(([name, d]) => ({
        name,
        games: d.count,
        avgAccuracy: Math.round((d.accSum / d.count) * 10) / 10
      }))
      .sort((a, b) => a.avgAccuracy - b.avgAccuracy)
      .slice(0, 5);

    return { days, worstGames, phaseAverages, worstOpenings };
  }

  static async getRatingHistory(userId: string, args: RatingHistoryArgs) {
    const limit = Math.min(args.limit ?? 20, 50);

    const where: Record<string, unknown> = { userId, playerRating: { not: null } };
    if (args.timeControl) where.timeControl = args.timeControl;

    const games = await prisma.game.findMany({
      where,
      include: { metrics: true },
      orderBy: { playedAt: 'desc' },
      take: limit
    });

    return games.reverse().map((g) => ({
      playedAt: g.playedAt,
      rating: g.playerRating,
      result: g.result,
      accuracy: g.metrics?.accuracy ?? null,
      opponent: g.opponent,
      timeControl: g.timeControl
    }));
  }
}

const handlerMap: Record<string, (userId: string, args: Record<string, unknown>) => Promise<unknown>> = {
  get_performance_summary: (userId, args) => ToolHandlers.getPerformanceSummary(userId, args),
  get_recent_games: (userId, args) => ToolHandlers.getRecentGames(userId, args),
  get_game_analysis: (userId, args) => ToolHandlers.getGameAnalysis(userId, args),
  get_opening_stats: (userId, args) => ToolHandlers.getOpeningStats(userId, args),
  get_weakness_report: (userId, args) => ToolHandlers.getWeaknessReport(userId, args),
  get_rating_history: (userId, args) => ToolHandlers.getRatingHistory(userId, args)
};

export async function executeToolCall(
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const handler = handlerMap[name];
  if (!handler) return { error: `Unknown tool: ${name}` };
  return handler(userId, args);
}
