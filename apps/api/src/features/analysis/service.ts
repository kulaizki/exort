import { prisma } from '../../lib/prisma.js';

export class AnalysisService {
  static async enqueue(gameId: string, userId: string) {
    const game = await prisma.game.findFirst({ where: { id: gameId, userId } });
    if (!game) return null;

    const existing = await prisma.analysisJob.findUnique({ where: { gameId } });
    if (existing) {
      if (existing.status === 'FAILED') {
        return prisma.analysisJob.update({
          where: { gameId },
          data: { status: 'PENDING', startedAt: null, completedAt: null }
        });
      }
      return existing;
    }

    return prisma.analysisJob.create({
      data: { gameId }
    });
  }

  static async getStatus(jobId: string) {
    return prisma.analysisJob.findUnique({ where: { id: jobId } });
  }

  static async getActiveJobCounts(userId: string) {
    const jobs = await prisma.analysisJob.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        game: { userId }
      },
      select: { status: true }
    });
    const processing = jobs.filter((j) => j.status === 'PROCESSING').length;
    const pending = jobs.filter((j) => j.status === 'PENDING').length;
    return { total: jobs.length, processing, pending };
  }

  static async cleanupStaleJobs(userId: string) {
    const result = await prisma.analysisJob.deleteMany({
      where: {
        status: 'PENDING',
        game: { userId }
      }
    });
    return { deleted: result.count };
  }
}
