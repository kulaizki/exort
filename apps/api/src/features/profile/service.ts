import { prisma } from '../../lib/prisma.js';

export class ProfileService {
  static async get(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true }
    });

    const lichess = await prisma.lichessAccount.findUnique({
      where: { userId },
      select: { lichessUsername: true, lastSyncedAt: true }
    });

    return { ...user, lichess };
  }

  static async update(userId: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, image: true }
    });
  }
}
