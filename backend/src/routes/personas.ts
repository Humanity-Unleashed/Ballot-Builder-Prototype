/**
 * Persona Routes
 *
 * GET  /api/personas              - List all personas
 * GET  /api/personas/:id          - Get a single persona
 * GET  /api/personas/:id/preferences - Get persona's policy preferences
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate';
import * as personaController from '../controllers/personaController';

const router = Router();

/**
 * GET /api/personas
 * List all available personas
 */
router.get('/', personaController.listPersonas);

/**
 * GET /api/personas/:id
 * Get a single persona by ID
 */
router.get(
  '/:id',
  [
    param('id').isString().notEmpty().withMessage('Persona ID is required'),
    validate,
  ],
  personaController.getPersona
);

/**
 * GET /api/personas/:id/preferences
 * Get a persona's policy preferences
 */
router.get(
  '/:id/preferences',
  [
    param('id').isString().notEmpty().withMessage('Persona ID is required'),
    validate,
  ],
  personaController.getPreferences
);

export default router;
