import { prisma } from '../../lib/prisma.js';
import { geminiChat } from './gemini.js';

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

    try {
      const history = await prisma.chatMessage.findMany({
        where: { sessionId, id: { not: userMessage.id } },
        orderBy: { createdAt: 'asc' }
      });

      const result = await geminiChat(userId, content, history, session.gameId);

      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: result.text,
          context:
            result.toolCalls.length > 0
              ? (JSON.parse(JSON.stringify(result.toolCalls)) as object[])
              : undefined
        }
      });

      return { userMessage, assistantMessage };
    } catch (err) {
      console.error('Gemini chat error:', err);

      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content:
            'I encountered an error while processing your request. Please try again in a moment.'
        }
      });

      return { userMessage, assistantMessage };
    }
  }
}
