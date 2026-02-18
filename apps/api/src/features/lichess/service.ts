import { prisma } from '../../lib/prisma.js';

export class LichessService {
  static async connect(userId: string, lichessUsername: string) {
    return prisma.lichessAccount.upsert({
      where: { userId },
      create: { userId, lichessUsername },
      update: { lichessUsername }
    });
  }

  static async disconnect(userId: string) {
    const account = await prisma.lichessAccount.findUnique({ where: { userId } });
    if (!account) return null;
    return prisma.lichessAccount.delete({ where: { userId } });
  }
}
