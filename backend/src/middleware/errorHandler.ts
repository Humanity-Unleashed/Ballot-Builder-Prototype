/**
 * Error Handling Middleware
 *
 * Centralized error handling for the API.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError, ValidationError } from '../utils/errors';

interface ErrorResponse {
  error: string;
  code: string;
  errors?: unknown[];
}

interface SyntaxErrorWithBody extends SyntaxError {
  status?: number;
  body?: unknown;
}

/**
 * Not found handler (404)
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    path: req.path,
  });
}

/**
 * Global error handler
 */
export function errorHandler(
  err: Error & { statusCode?: number; code?: string; status?: number; array?: () => unknown[] },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if ((err.statusCode && err.statusCode >= 500) || !err.statusCode) {
    logger.error('Server error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      code: err.code,
      path: req.path,
      method: req.method,
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
    };

    // Include validation errors if present
    if (err instanceof ValidationError && err.errors) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors (kept for future use)
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'A record with this value already exists',
      code: 'DUPLICATE_ENTRY',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND',
    });
    return;
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.array(),
    });
    return;
  }

  // Handle JSON parsing errors
  const syntaxErr = err as SyntaxErrorWithBody;
  if (err instanceof SyntaxError && syntaxErr.status === 400 && 'body' in syntaxErr) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
    return;
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}
