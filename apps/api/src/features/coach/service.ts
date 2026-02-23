import { prisma } from '../../lib/prisma.js';

export class CoachService {
  static async createSession(userId: string, title?: string, gameId?: string) {
    return prisma.chatSession.create({
      data: { userId, title, gameId }
    });
  }

  static async listSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } }
    });
  }

  static async deleteSession(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) return null;
    return prisma.chatSession.delete({ where: { id: sessionId } });
  }

  static async getMessages(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) return null;
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async sendMessage(sessionId: string, userId: string, content: string) {
    const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) return null;

    const userMessage = await prisma.chatMessage.create({
      data: { sessionId, role: 'USER', content }
    });

    // TODO: Build context from game metrics, call Gemini API
    const aiResponse = 'AI coaching response placeholder — Gemini API integration pending.';

    const assistantMessage = await prisma.chatMessage.create({
      data: { sessionId, role: 'ASSISTANT', content: aiResponse }
    });

    return { userMessage, assistantMessage };
  }
}
