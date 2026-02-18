import { Router } from 'express';
import { AnalysisService } from './service.js';
import { enqueueBody, jobIdParam } from './schema.js';

export const analysisRouter = Router();

analysisRouter.post('/enqueue', async (req, res, next) => {
  try {
    const { gameId } = enqueueBody.parse(req.body);
    const job = await AnalysisService.enqueue(gameId, req.userId!);
    if (!job) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

analysisRouter.get('/status/:jobId', async (req, res, next) => {
  try {
    const { jobId } = jobIdParam.parse(req.params);
    const job = await AnalysisService.getStatus(jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});
