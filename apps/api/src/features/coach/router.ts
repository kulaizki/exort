import { Router } from 'express';
import { CoachService } from './service.js';
import { createSessionBody, sessionIdParam, sendMessageBody } from './schema.js';

export const coachRouter = Router();

coachRouter.post('/sessions', async (req, res, next) => {
  try {
    const { title, gameId } = createSessionBody.parse(req.body);
    const session = await CoachService.createSession(req.userId!, title, gameId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

coachRouter.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await CoachService.listSessions(req.userId!);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

coachRouter.delete('/sessions/:id', async (req, res, next) => {
  try {
    const { id } = sessionIdParam.parse(req.params);
    const result = await CoachService.deleteSession(id, req.userId!);
    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

coachRouter.get('/sessions/:id/messages', async (req, res, next) => {
  try {
    const { id } = sessionIdParam.parse(req.params);
    const messages = await CoachService.getMessages(id, req.userId!);
    if (!messages) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

coachRouter.post('/sessions/:id/messages', async (req, res, next) => {
  try {
    const { id } = sessionIdParam.parse(req.params);
    const { content } = sendMessageBody.parse(req.body);
    const result = await CoachService.sendMessage(id, req.userId!, content);
    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
