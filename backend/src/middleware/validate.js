/**
 * Validation Middleware
 *
 * Wrapper for express-validator to standardize validation error handling.
 */

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Process validation results and throw if errors exist
 * Use this after express-validator check chains
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError(formattedErrors);
  }

  next();
}

module.exports = { validate };
