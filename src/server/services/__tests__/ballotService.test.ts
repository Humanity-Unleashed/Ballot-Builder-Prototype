import { describe, it, expect } from 'vitest';
import * as ballotService from '../ballotService';

describe('ballotService', () => {
  describe('listBallots', () => {
    it('returns an array of ballots', () => {
      const ballots = ballotService.listBallots();
      expect(Array.isArray(ballots)).toBe(true);
      expect(ballots.length).toBeGreaterThan(0);
    });

    it('each ballot has required fields', () => {
      const ballots = ballotService.listBallots();
      for (const b of ballots) {
        expect(b.id).toBeTruthy();
        expect(b.state).toBeTruthy();
        expect(b.county).toBeTruthy();
        expect(b.electionDate).toBeTruthy();
        expect(Array.isArray(b.items)).toBe(true);
      }
    });
  });

  describe('findBallotById', () => {
    it('finds existing ballot', () => {
      const ballots = ballotService.listBallots();
      const found = ballotService.findBallotById(ballots[0].id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(ballots[0].id);
    });

    it('returns null for nonexistent ballot', () => {
      expect(ballotService.findBallotById('nonexistent')).toBeNull();
    });
  });

  describe('getDefaultBallotData', () => {
    it('returns a ballot', () => {
      const ballot = ballotService.getDefaultBallotData();
      expect(ballot).toBeDefined();
      expect(ballot.id).toBeTruthy();
      expect(Array.isArray(ballot.items)).toBe(true);
    });
  });

  describe('listCandidates', () => {
    it('returns all candidates without filter', () => {
      const candidates = ballotService.listCandidates();
      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.length).toBeGreaterThan(0);
    });

    it('each candidate has required fields', () => {
      const candidates = ballotService.listCandidates();
      for (const c of candidates) {
        expect(c.id).toBeTruthy();
        expect(c.name).toBeTruthy();
      }
    });
  });

  describe('getCandidateWithContext', () => {
    it('returns candidate with context and sources', () => {
      const candidates = ballotService.listCandidates();
      if (candidates.length === 0) return;
      const result = ballotService.getCandidateWithContext(candidates[0].id);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(candidates[0].id);
      expect(Array.isArray(result!.context)).toBe(true);
      expect(Array.isArray(result!.sources)).toBe(true);
    });

    it('returns null for nonexistent candidate', () => {
      expect(ballotService.getCandidateWithContext('nonexistent')).toBeNull();
    });
  });

  describe('getBallotSummary', () => {
    it('returns summary for existing ballot', () => {
      const ballots = ballotService.listBallots();
      const summary = ballotService.getBallotSummary(ballots[0].id);
      expect(summary).not.toBeNull();
      expect(summary!.id).toBe(ballots[0].id);
      expect(typeof summary!.contestCount).toBe('number');
      expect(typeof summary!.measureCount).toBe('number');
      expect(summary!.totalItems).toBe(summary!.contestCount + summary!.measureCount);
    });

    it('returns null for nonexistent ballot', () => {
      expect(ballotService.getBallotSummary('nonexistent')).toBeNull();
    });
  });

  describe('getOverallSummary', () => {
    it('returns global counts', () => {
      const summary = ballotService.getOverallSummary();
      expect(summary.ballotCount).toBeGreaterThan(0);
      expect(typeof summary.contestCount).toBe('number');
      expect(typeof summary.measureCount).toBe('number');
      expect(typeof summary.candidateCount).toBe('number');
    });
  });

  describe('listMeasures', () => {
    it('returns an array', () => {
      const measures = ballotService.listMeasures();
      expect(Array.isArray(measures)).toBe(true);
    });
  });

  describe('findMeasureById', () => {
    it('returns null for nonexistent measure', () => {
      expect(ballotService.findMeasureById('nonexistent')).toBeNull();
    });
  });

  describe('listContests', () => {
    it('returns an array', () => {
      const contests = ballotService.listContests();
      expect(Array.isArray(contests)).toBe(true);
    });
  });
});
