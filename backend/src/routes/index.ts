/**
 * API Routes Index
 *
 * Aggregates all route modules.
 * Prototype: No authentication required.
 */

import { Router, Request, Response } from 'express';
import personaRoutes from './personas';
import blueprintRoutes from './blueprint';
import civicAxesRoutes from './civicAxes';
import ballotRoutes from './ballot';
import contestRoutes from './contests';
import measureRoutes from './measures';
import candidateRoutes from './candidates';
import assessmentRoutes from './assessment';
import fineTuningRoutes from './fineTuning';

const router = Router();

// Mount route modules
router.use('/personas', personaRoutes);
router.use('/blueprint', blueprintRoutes);
router.use('/civic-axes', civicAxesRoutes);
router.use('/ballot', ballotRoutes);
router.use('/contests', contestRoutes);
router.use('/measures', measureRoutes);
router.use('/candidates', candidateRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/fine-tuning', fineTuningRoutes);

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
      civicAxes: {
        spec: 'GET /api/civic-axes/spec',
        summary: 'GET /api/civic-axes/summary',
        domains: 'GET /api/civic-axes/domains',
        domain: 'GET /api/civic-axes/domains/:domainId',
        axes: 'GET /api/civic-axes/axes',
        axis: 'GET /api/civic-axes/axes/:axisId',
        items: 'GET /api/civic-axes/items?level=&tag=&axisId=',
        item: 'GET /api/civic-axes/items/:itemId',
        session: 'GET /api/civic-axes/session?count=15&level=&excludeIds=',
        score: 'POST /api/civic-axes/score',
        tags: 'GET /api/civic-axes/tags',
        responseScale: 'GET /api/civic-axes/response-scale',
      },
      ballot: {
        default: 'GET /api/ballot',
        summary: 'GET /api/ballot/summary',
        list: 'GET /api/ballot/all',
        get: 'GET /api/ballot/:ballotId',
        ballotSummary: 'GET /api/ballot/:ballotId/summary',
        ballotContests: 'GET /api/ballot/:ballotId/contests',
        ballotMeasures: 'GET /api/ballot/:ballotId/measures',
        ballotItem: 'GET /api/ballot/:ballotId/items/:itemId',
      },
      contests: {
        list: 'GET /api/contests',
        get: 'GET /api/contests/:contestId',
        candidates: 'GET /api/contests/:contestId/candidates',
      },
      measures: {
        list: 'GET /api/measures',
        get: 'GET /api/measures/:measureId',
      },
      candidates: {
        list: 'GET /api/candidates?contestId=',
        get: 'GET /api/candidates/:candidateId',
        context: 'GET /api/candidates/:candidateId/context?topicId=',
        sources: 'GET /api/candidates/:candidateId/sources',
      },
      assessment: {
        start: 'POST /api/assessment/start',
        getSession: 'GET /api/assessment/:sessionId',
        submitAnswer: 'POST /api/assessment/:sessionId/answer',
        complete: 'POST /api/assessment/:sessionId/complete',
        delete: 'DELETE /api/assessment/:sessionId',
      },
      fineTuning: {
        submit: 'POST /api/fine-tuning/submit',
        sessions: 'GET /api/fine-tuning/sessions',
        getSession: 'GET /api/fine-tuning/:sessionId',
        getAxisData: 'GET /api/fine-tuning/:sessionId/axis/:axisId',
        deleteSession: 'DELETE /api/fine-tuning/:sessionId',
        clearAxis: 'DELETE /api/fine-tuning/:sessionId/axis/:axisId',
      },
    },
  });
});

export default router;
