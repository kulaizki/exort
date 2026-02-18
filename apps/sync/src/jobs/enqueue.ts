import { prisma } from '../lib/prisma.js';

export async function enqueueAnalysisJobs(gameIds: string[]): Promise<void> {
  if (gameIds.length === 0) return;

  const existing = await prisma.analysisJob.findMany({
    where: { gameId: { in: gameIds } },
    select: { gameId: true }
  });

  const existingGameIds = new Set(existing.map((j) => j.gameId));
  const newGameIds = gameIds.filter((id) => !existingGameIds.has(id));

  if (newGameIds.length === 0) return;

  await prisma.analysisJob.createMany({
    data: newGameIds.map((gameId) => ({ gameId, status: 'PENDING' as const }))
  });
}
