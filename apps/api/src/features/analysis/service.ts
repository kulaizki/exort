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

  static async getStatus(jobId: string) {
    return prisma.analysisJob.findUnique({ where: { id: jobId } });
  }
}
