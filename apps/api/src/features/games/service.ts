import { prisma } from '../../lib/prisma.js';
import type { z } from 'zod';
import type { listGamesQuery } from './schema.js';

type ListGamesInput = z.infer<typeof listGamesQuery>;

export class GamesService {
  static async list(userId: string, query: ListGamesInput) {
    const { page, limit, timeControl, result, opening, from, to, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (timeControl) where.timeControl = timeControl;
    if (result) where.result = result;
    if (from || to) {
      where.playedAt = {
        ...(from && { gte: from }),
        ...(to && { lte: to })
      };
    }
    if (opening) {
      where.metrics = { openingName: { contains: opening, mode: 'insensitive' } };
    }

    const orderBy: Record<string, string> = {};
    if (sort === 'date') orderBy.playedAt = order;
    else if (sort === 'accuracy') orderBy.metrics = { accuracy: order } as unknown as string;
    else if (sort === 'blunders') orderBy.metrics = { blunderCount: order } as unknown as string;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: { metrics: true, analysisJob: { select: { status: true } } },
        orderBy: sort === 'date' ? { playedAt: order } : undefined,
        skip,
        take: limit
      }),
      prisma.game.count({ where })
    ]);

    return { data: games, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getById(gameId: string, userId: string) {
    return prisma.game.findFirst({
      where: { id: gameId, userId },
      include: {
        metrics: true,
        analysisJob: true,
        moveEvaluations: { orderBy: [{ moveNumber: 'asc' }, { color: 'asc' }] }
      }
    });
  }
}
