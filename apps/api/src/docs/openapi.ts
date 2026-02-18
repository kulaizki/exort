import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Schemas — Games
import { listGamesQuery, gameIdParam } from '../features/games/schema.js';
// Schemas — Metrics
import { trendsQuery } from '../features/metrics/schema.js';
// Schemas — Analysis
import { enqueueBody, jobIdParam } from '../features/analysis/schema.js';
// Schemas — Coach
import { createSessionBody, sessionIdParam, sendMessageBody } from '../features/coach/schema.js';
// Schemas — Profile
import { updateProfileBody } from '../features/profile/schema.js';
// Schemas — Lichess
import { connectBody } from '../features/lichess/schema.js';

const registry = new OpenAPIRegistry();

// Security scheme
const bearerAuth = registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});

// ─── Health ───────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health check',
  responses: {
    200: { description: 'API is healthy' }
  }
});

// ─── Games ────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/games',
  tags: ['Games'],
  summary: 'List games',
  security: [{ [bearerAuth.name]: [] }],
  request: { query: listGamesQuery },
  responses: {
    200: { description: 'Paginated list of games' },
    401: { description: 'Unauthorized' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/games/{id}',
  tags: ['Games'],
  summary: 'Get game by ID',
  security: [{ [bearerAuth.name]: [] }],
  request: { params: gameIdParam },
  responses: {
    200: { description: 'Game details' },
    401: { description: 'Unauthorized' },
    404: { description: 'Game not found' }
  }
});

// ─── Metrics ──────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/metrics/summary',
  tags: ['Metrics'],
  summary: 'Get metrics summary',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'Metrics summary for the user' },
    401: { description: 'Unauthorized' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/metrics/trends',
  tags: ['Metrics'],
  summary: 'Get metrics trends',
  security: [{ [bearerAuth.name]: [] }],
  request: { query: trendsQuery },
  responses: {
    200: { description: 'Metrics trends over time' },
    401: { description: 'Unauthorized' }
  }
});

// ─── Sync ─────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/sync/trigger',
  tags: ['Sync'],
  summary: 'Trigger Lichess game sync',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'Sync triggered successfully' },
    401: { description: 'Unauthorized' }
  }
});

// ─── Analysis ─────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/analysis/enqueue',
  tags: ['Analysis'],
  summary: 'Enqueue game for analysis',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: enqueueBody } } } },
  responses: {
    201: { description: 'Analysis job created' },
    401: { description: 'Unauthorized' },
    404: { description: 'Game not found' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/analysis/status/{jobId}',
  tags: ['Analysis'],
  summary: 'Get analysis job status',
  security: [{ [bearerAuth.name]: [] }],
  request: { params: jobIdParam },
  responses: {
    200: { description: 'Analysis job status' },
    401: { description: 'Unauthorized' },
    404: { description: 'Job not found' }
  }
});

// ─── Coach ────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/chat/sessions',
  tags: ['Coach'],
  summary: 'Create coaching session',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: createSessionBody } } } },
  responses: {
    201: { description: 'Session created' },
    401: { description: 'Unauthorized' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/chat/sessions',
  tags: ['Coach'],
  summary: 'List coaching sessions',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'List of coaching sessions' },
    401: { description: 'Unauthorized' }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/chat/sessions/{id}',
  tags: ['Coach'],
  summary: 'Delete coaching session',
  security: [{ [bearerAuth.name]: [] }],
  request: { params: sessionIdParam },
  responses: {
    204: { description: 'Session deleted' },
    401: { description: 'Unauthorized' },
    404: { description: 'Session not found' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/chat/sessions/{id}/messages',
  tags: ['Coach'],
  summary: 'Get session messages',
  security: [{ [bearerAuth.name]: [] }],
  request: { params: sessionIdParam },
  responses: {
    200: { description: 'List of messages in the session' },
    401: { description: 'Unauthorized' },
    404: { description: 'Session not found' }
  }
});

registry.registerPath({
  method: 'post',
  path: '/chat/sessions/{id}/messages',
  tags: ['Coach'],
  summary: 'Send message to coaching session',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: sessionIdParam,
    body: { content: { 'application/json': { schema: sendMessageBody } } }
  },
  responses: {
    201: { description: 'Message sent and AI response returned' },
    401: { description: 'Unauthorized' },
    404: { description: 'Session not found' }
  }
});

// ─── Profile ──────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/profile',
  tags: ['Profile'],
  summary: 'Get user profile',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'User profile' },
    401: { description: 'Unauthorized' },
    404: { description: 'Profile not found' }
  }
});

registry.registerPath({
  method: 'patch',
  path: '/profile',
  tags: ['Profile'],
  summary: 'Update user profile',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: updateProfileBody } } } },
  responses: {
    200: { description: 'Updated profile' },
    401: { description: 'Unauthorized' }
  }
});

// ─── Lichess ──────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/lichess/connect',
  tags: ['Lichess'],
  summary: 'Connect Lichess account',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: connectBody } } } },
  responses: {
    201: { description: 'Lichess account connected' },
    401: { description: 'Unauthorized' }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/lichess/disconnect',
  tags: ['Lichess'],
  summary: 'Disconnect Lichess account',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    204: { description: 'Lichess account disconnected' },
    401: { description: 'Unauthorized' },
    404: { description: 'No Lichess account connected' }
  }
});

// ─── Generate document ───────────────────────────────────

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Exort API',
    version: '0.1.0',
    description: 'Chess improvement platform — game sync, analysis, and AI coaching'
  }
});
