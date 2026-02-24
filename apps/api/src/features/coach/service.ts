import { prisma } from '../../lib/prisma.js';
import { geminiChat, geminiChatStream, generateTitle, type StreamEvent } from './gemini.js';

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

      // Auto-generate title on first message (fire-and-forget)
      if (history.length === 0 && !session.title) {
        generateTitle(content)
          .then((title) => prisma.chatSession.update({ where: { id: sessionId }, data: { title } }))
          .catch(() => {});
      }

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

  static async sendMessageStream(
    sessionId: string,
    userId: string,
    content: string,
    write: (event: StreamEvent) => void
  ) {
    const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) return null;

    await prisma.chatMessage.create({
      data: { sessionId, role: 'USER', content }
    });

    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });
    // Exclude the user message we just created (it's the last one)
    const previousMessages = history.slice(0, -1);

    let fullText = '';
    const toolCalls: { name: string; label: string }[] = [];

    try {
      for await (const event of geminiChatStream(userId, content, previousMessages, session.gameId)) {
        write(event);
        if (event.type === 'text') fullText += event.content;
        if (event.type === 'tool_call') toolCalls.push({ name: event.name, label: event.label });
      }
    } catch (err) {
      console.error('Gemini stream error:', err);
      if (!fullText) {
        fullText = 'I encountered an error while processing your request. Please try again in a moment.';
        write({ type: 'text', content: fullText });
      }
    }

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: fullText || 'No response generated.',
        context: toolCalls.length > 0 ? (JSON.parse(JSON.stringify(toolCalls)) as object[]) : undefined
      }
    });

    // Auto-generate title on first message
    if (previousMessages.length === 0 && !session.title) {
      generateTitle(content)
        .then((title) => prisma.chatSession.update({ where: { id: sessionId }, data: { title } }))
        .catch(() => {});
    }

    return { ok: true };
  }
}
