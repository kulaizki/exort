import { prisma } from '../lib/prisma.js';
import { LichessClient } from '../lichess/client.js';
import { parseNdjsonLine } from '../lichess/parser.js';
import { mapLichessGame } from './mapper.js';
import { enqueueAnalysisJobs } from '../jobs/enqueue.js';
import type { Prisma } from '@exort/db';

const BATCH_SIZE = 50;

export class SyncService {
  static async syncUser(userId: string): Promise<{ synced: number }> {
    const lichessAccount = await prisma.lichessAccount.findUnique({
      where: { userId }
    });

    if (!lichessAccount) {
      throw new Error(`No Lichess account linked for user ${userId}`);
    }

    const { lichessUsername, lastSyncedAt } = lichessAccount;
    const client = new LichessClient();

    let synced = 0;
    let batch: Prisma.GameCreateManyInput[] = [];
    const newGameIds: string[] = [];

    const flushBatch = async () => {
      if (batch.length === 0) return;
      const result = await prisma.game.createMany({
        data: batch,
        skipDuplicates: true
      });
      synced += result.count;

      const createdGames = await prisma.game.findMany({
        where: { lichessGameId: { in: batch.map((g) => g.lichessGameId) }, userId },
        select: { id: true }
      });
      newGameIds.push(...createdGames.map((g) => g.id));
      batch = [];
    };

    for await (const line of client.fetchGames(lichessUsername, lastSyncedAt ?? undefined)) {
      const game = parseNdjsonLine(line);
      if (!game) continue;
      batch.push(mapLichessGame(game, userId, lichessUsername));
      if (batch.length >= BATCH_SIZE) {
        await flushBatch();
      }
    }

    await flushBatch();

    await prisma.lichessAccount.update({
      where: { userId },
      data: { lastSyncedAt: new Date() }
    });

    await enqueueAnalysisJobs(newGameIds);

    return { synced };
  }
}
