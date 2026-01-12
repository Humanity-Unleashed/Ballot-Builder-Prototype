/**
 * Blueprint Controller
 *
 * Handles HTTP requests for the Civic Blueprint feature.
 */

const blueprintService = require('../services/blueprintService');
const logger = require('../utils/logger');

/**
 * GET /api/blueprint/statements
 * Get policy statements for the user to respond to
 */
async function getStatements(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit, issueArea } = req.query;

    const statements = await blueprintService.getStatements(userId, {
      limit: limit ? parseInt(limit, 10) : 10,
      issueArea: issueArea || null,
    });

    res.json({
      statements,
      count: statements.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/blueprint/response
 * Record a user's response to a policy statement
 */
async function recordResponse(req, res, next) {
  try {
    const userId = req.user.id;
    const { statementId, response } = req.body;

    const progress = await blueprintService.recordResponse(userId, statementId, response);

    res.json({
      message: 'Response recorded',
      progress,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/progress
 * Get the user's blueprint completion progress
 */
async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;

    const progress = await blueprintService.getProgress(userId);

    res.json({
      progress,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/summary
 * Get a summary of the user's civic blueprint
 */
async function getSummary(req, res, next) {
  try {
    const userId = req.user.id;

    const summary = await blueprintService.getSummary(userId);

    res.json({
      summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/statements/:issueArea
 * Get statements for a specific issue area (to improve confidence)
 */
async function getStatementsForArea(req, res, next) {
  try {
    const userId = req.user.id;
    const { issueArea } = req.params;

    const statements = await blueprintService.getStatementsForArea(userId, issueArea);

    res.json({
      issueArea,
      statements,
      count: statements.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/blueprint/areas
 * Get all available issue areas
 */
async function getIssueAreas(req, res, next) {
  try {
    res.json({
      areas: blueprintService.ISSUE_AREAS,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStatements,
  recordResponse,
  getProgress,
  getSummary,
  getStatementsForArea,
  getIssueAreas,
};
