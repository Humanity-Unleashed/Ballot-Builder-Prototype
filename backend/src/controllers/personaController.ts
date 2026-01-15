/**
 * Persona Controller
 *
 * Handles HTTP requests for persona endpoints.
 * Personas are pre-defined voter profiles with policy preferences.
 */

import { Request, Response, NextFunction } from 'express';
import {
  getAllPersonas,
  getPersonaById,
  getPersonaPreferences,
} from '../data';

/**
 * GET /api/personas
 * List all available personas
 */
export async function listPersonas(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const personas = getAllPersonas();

    res.json({
      personas,
      count: personas.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/personas/:id
 * Get a single persona by ID
 */
export async function getPersona(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const persona = getPersonaById(id);

    if (!persona) {
      res.status(404).json({
        error: 'Persona not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({ persona });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/personas/:id/preferences
 * Get a persona's policy preferences
 */
export async function getPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const persona = getPersonaById(id);

    if (!persona) {
      res.status(404).json({
        error: 'Persona not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    const preferences = getPersonaPreferences(id);

    res.json({
      personaId: id,
      personaName: persona.name,
      preferences,
    });
  } catch (error) {
    next(error);
  }
}
