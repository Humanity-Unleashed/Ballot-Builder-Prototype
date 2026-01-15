/**
 * Validation Middleware
 *
 * Wrapper for express-validator to standardize validation error handling.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../utils/errors';

interface FormattedError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Process validation results and throw if errors exist
 * Use this after express-validator check chains
 */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: FormattedError[] = errors.array().map((err: ExpressValidationError) => ({
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
      value: 'value' in err ? err.value : undefined,
    }));

    throw new ValidationError(formattedErrors);
  }

  next();
}
