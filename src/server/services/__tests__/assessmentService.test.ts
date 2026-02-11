import { describe, it, expect } from 'vitest';
import * as assessmentService from '../assessmentService';

describe('assessmentService', () => {
  describe('startAssessment', () => {
    it('creates a session with first question', () => {
      const result = assessmentService.startAssessment();
      expect(result.session).toBeDefined();
      expect(result.session.id).toBeTruthy();
      expect(result.session.status).toBe('in_progress');
      expect(result.firstQuestion).not.toBeNull();
    });

    it('creates session with selected domains', () => {
      const result = assessmentService.startAssessment(['econ', 'health']);
      expect(result.session.selectedDomains).toContain('econ');
      expect(result.session.selectedDomains).toContain('health');
    });

    it('filters invalid domain IDs', () => {
      const result = assessmentService.startAssessment(['econ', 'invalid_domain']);
      expect(result.session.selectedDomains).toContain('econ');
      expect(result.session.selectedDomains).not.toContain('invalid_domain');
    });
  });

  describe('getSession', () => {
    it('retrieves existing session', () => {
      const { session } = assessmentService.startAssessment();
      const retrieved = assessmentService.getSession(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
    });

    it('returns null for nonexistent session', () => {
      expect(assessmentService.getSession('nonexistent')).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('records answer and returns next question', () => {
      const { session, firstQuestion } = assessmentService.startAssessment();
      expect(firstQuestion).not.toBeNull();

      const result = assessmentService.submitAnswer(
        session.id,
        firstQuestion!.id,
        'agree'
      );
      expect(result).not.toBeNull();
      expect(result!.session.swipes).toHaveLength(1);
      expect(Array.isArray(result!.scores)).toBe(true);
    });

    it('returns null for nonexistent session', () => {
      expect(assessmentService.submitAnswer('bad-id', 'item', 'agree')).toBeNull();
    });

    it('progresses through multiple answers', () => {
      const { session, firstQuestion } = assessmentService.startAssessment();
      let currentQuestion = firstQuestion;
      let lastResult = null;

      for (let i = 0; i < 3 && currentQuestion; i++) {
        lastResult = assessmentService.submitAnswer(
          session.id,
          currentQuestion.id,
          'agree'
        );
        currentQuestion = lastResult?.nextQuestion ?? null;
      }

      expect(lastResult).not.toBeNull();
      expect(lastResult!.session.swipes.length).toBe(3);
    });
  });

  describe('completeAssessment', () => {
    it('completes existing session', () => {
      const { session } = assessmentService.startAssessment();
      const result = assessmentService.completeAssessment(session.id);
      expect(result).not.toBeNull();
      expect(result!.session.status).toBe('completed');
      expect(Array.isArray(result!.finalScores)).toBe(true);
    });

    it('returns null for nonexistent session', () => {
      expect(assessmentService.completeAssessment('nonexistent')).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('deletes existing session', () => {
      const { session } = assessmentService.startAssessment();
      expect(assessmentService.deleteSession(session.id)).toBe(true);
      expect(assessmentService.getSession(session.id)).toBeNull();
    });

    it('returns false for nonexistent session', () => {
      expect(assessmentService.deleteSession('nonexistent')).toBe(false);
    });
  });

  describe('full assessment flow', () => {
    it('start -> answer -> answer -> complete', () => {
      const { session, firstQuestion } = assessmentService.startAssessment();
      expect(firstQuestion).not.toBeNull();

      // Answer first question
      const r1 = assessmentService.submitAnswer(session.id, firstQuestion!.id, 'agree');
      expect(r1).not.toBeNull();

      // Answer second question if available
      if (r1!.nextQuestion) {
        const r2 = assessmentService.submitAnswer(session.id, r1!.nextQuestion.id, 'disagree');
        expect(r2).not.toBeNull();
      }

      // Complete
      const final = assessmentService.completeAssessment(session.id);
      expect(final).not.toBeNull();
      expect(final!.session.status).toBe('completed');

      // Cannot submit after completion
      const afterComplete = assessmentService.submitAnswer(session.id, 'any', 'agree');
      expect(afterComplete).toBeNull();
    });
  });
});
