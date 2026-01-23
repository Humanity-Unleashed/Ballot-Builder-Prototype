/**
 * Assessment Controller
 *
 * HTTP handlers for the adaptive assessment endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as assessmentService from '../services/assessmentService';
import type {
  StartAssessmentRequest,
  SubmitAnswerRequest,
  CompleteAssessmentRequest,
} from '../types';

/**
 * POST /api/assessment/start
 * Start a new assessment session
 */
export async function startAssessment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { selectedDomains, userId } = req.body as StartAssessmentRequest;

    const { session, firstQuestion } = assessmentService.startAssessment(
      selectedDomains,
      userId
    );

    if (!firstQuestion) {
      res.status(400).json({
        error: 'No questions available for the selected domains',
        code: 'NO_QUESTIONS_AVAILABLE',
      });
      return;
    }

    const progress = assessmentService.getProgress(session.adaptiveState);

    res.status(201).json({
      sessionId: session.id,
      firstQuestion,
      progress,
      selectedDomains: session.selectedDomains,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/assessment/:sessionId
 * Get current session state (for resuming)
 */
export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;

    const session = assessmentService.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
      return;
    }

    const currentQuestion = assessmentService.getCurrentQuestion(sessionId);
    const scores = assessmentService.getSessionScores(sessionId);
    const progress = assessmentService.getProgress(session.adaptiveState);

    res.json({
      sessionId: session.id,
      status: session.status,
      currentQuestion,
      answeredItems: session.adaptiveState.answeredItems,
      scores,
      progress,
      selectedDomains: session.selectedDomains,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/assessment/:sessionId/answer
 * Submit an answer and get the next question
 */
export async function submitAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;
    const { itemId, response } = req.body as SubmitAnswerRequest;

    const result = assessmentService.submitAnswer(sessionId, itemId, response);

    if (!result) {
      res.status(404).json({
        error: 'Session not found or already completed',
        code: 'SESSION_NOT_FOUND_OR_COMPLETED',
      });
      return;
    }

    const progress = assessmentService.getProgress(result.session.adaptiveState);

    res.json({
      nextQuestion: result.nextQuestion,
      scores: result.scores,
      progress,
      isComplete: result.isComplete,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/assessment/:sessionId/complete
 * Manually complete an assessment session
 */
export async function completeAssessment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;
    const { saveToProfile } = req.body as CompleteAssessmentRequest;

    const result = assessmentService.completeAssessment(sessionId, saveToProfile);

    if (!result) {
      res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
      return;
    }

    res.json({
      sessionId: result.session.id,
      finalScores: result.finalScores,
      profileSaved: false, // TODO: implement profile saving
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/assessment/:sessionId
 * Abandon/delete an assessment session
 */
export async function deleteSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;

    const deleted = assessmentService.deleteSession(sessionId);

    if (!deleted) {
      res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
