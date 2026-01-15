/**
 * API Routes Index
 *
 * Aggregates all route modules.
 * Prototype: No authentication required.
 */

import { Router, Request, Response } from 'express';
import personaRoutes from './personas';
import blueprintRoutes from './blueprint';

const router = Router();

// Mount route modules
router.use('/personas', personaRoutes);
router.use('/blueprint', blueprintRoutes);

// API root info
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Ballot Builder API (Prototype)',
    version: '0.1.0-prototype',
    endpoints: {
      personas: {
        list: 'GET /api/personas',
        get: 'GET /api/personas/:id',
        preferences: 'GET /api/personas/:id/preferences',
      },
      blueprint: {
        statements: 'GET /api/blueprint/statements?excludeIds=id1,id2',
        statementsForArea: 'GET /api/blueprint/statements/:issueArea?excludeIds=id1,id2',
        areas: 'GET /api/blueprint/areas',
        start: 'GET /api/blueprint/start',
        next: 'GET /api/blueprint/next?currentStatementId=X&response=approve|disapprove',
      },
    },
  });
});

export default router;
