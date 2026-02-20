import { prisma } from '../../lib/prisma.js';

export class AnalysisService {
  static async enqueue(gameId: string, userId: string) {
    const game = await prisma.game.findFirst({ where: { id: gameId, userId } });
    if (!game) return null;

    const existing = await prisma.analysisJob.findUnique({ where: { gameId } });
    if (existing) return existing;

    return prisma.analysisJob.create({
      data: { gameId }
    });
  }

  static async batchEnqueue(gameIds: string[], userId: string) {
    const games = await prisma.game.findMany({
      where: { id: { in: gameIds }, userId },
      select: { id: true }
    });
    const validIds = games.map((g) => g.id);
    if (validIds.length === 0) return [];

    const existing = await prisma.analysisJob.findMany({
      where: { gameId: { in: validIds } },
      select: { gameId: true }
    });
    const existingIds = new Set(existing.map((j) => j.gameId));
    const newIds = validIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) return existing;

    await prisma.analysisJob.createMany({
      data: newIds.map((gameId) => ({ gameId }))
    });

    return prisma.analysisJob.findMany({
      where: { gameId: { in: validIds } }
    });
  }

  static async getStatus(jobId: string) {
    return prisma.analysisJob.findUnique({ where: { id: jobId } });
  }
}
