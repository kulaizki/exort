import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    req.userId = session.userId;
    req.user = session.user;
    next();
  } catch {
    res.status(500).json({ error: 'Authentication failed' });
  }
}
