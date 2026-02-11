import { describe, it, expect } from 'vitest';
import * as civicAxesService from '../civicAxesService';

describe('civicAxesService', () => {
  describe('getSpec', () => {
    it('returns the full spec', () => {
      const spec = civicAxesService.getSpec();
      expect(spec).toBeDefined();
      expect(Array.isArray(spec.domains)).toBe(true);
      expect(Array.isArray(spec.axes)).toBe(true);
      expect(Array.isArray(spec.items)).toBe(true);
      expect(spec.domains.length).toBeGreaterThan(0);
      expect(spec.axes.length).toBeGreaterThan(0);
      expect(spec.items.length).toBeGreaterThan(0);
    });

    it('each domain has id, name, and axes list', () => {
      const spec = civicAxesService.getSpec();
      for (const domain of spec.domains) {
        expect(domain.id).toBeTruthy();
        expect(domain.name).toBeTruthy();
        expect(Array.isArray(domain.axes)).toBe(true);
      }
    });
  });

  describe('getAllDomains', () => {
    it('returns domains array', () => {
      const domains = civicAxesService.getAllDomains();
      expect(Array.isArray(domains)).toBe(true);
      expect(domains.length).toBeGreaterThan(0);
    });
  });

  describe('getAllAxes', () => {
    it('returns axes array', () => {
      const axes = civicAxesService.getAllAxes();
      expect(Array.isArray(axes)).toBe(true);
      expect(axes.length).toBeGreaterThan(0);
    });

    it('each axis has id and domain_id', () => {
      const axes = civicAxesService.getAllAxes();
      for (const axis of axes) {
        expect(axis.id).toBeTruthy();
        expect(axis.domain_id).toBeTruthy();
      }
    });
  });

  describe('getItemsForSession', () => {
    it('returns items limited by count', () => {
      const items = civicAxesService.getItemsForSession({ count: 5 });
      expect(items.length).toBeLessThanOrEqual(5);
      expect(items.length).toBeGreaterThan(0);
    });

    it('excludes specified IDs', () => {
      const allItems = civicAxesService.getAllItems();
      const excludeIds = allItems.slice(0, 3).map((i) => i.id);
      const items = civicAxesService.getItemsForSession({ excludeIds });
      const returnedIds = items.map((i) => i.id);
      for (const eid of excludeIds) {
        expect(returnedIds).not.toContain(eid);
      }
    });
  });

  describe('scoreResponses', () => {
    it('returns axis scores for valid responses', () => {
      const items = civicAxesService.getAllItems();
      if (items.length === 0) return;
      const responses = items.slice(0, 3).map((item) => ({
        item_id: item.id,
        response: 'agree' as const,
      }));
      const scores = civicAxesService.scoreResponses(responses);
      expect(Array.isArray(scores)).toBe(true);
    });

    it('returns empty for empty responses', () => {
      const scores = civicAxesService.scoreResponses([]);
      expect(Array.isArray(scores)).toBe(true);
    });
  });

  describe('getResponseScale', () => {
    it('returns response scale mapping', () => {
      const scale = civicAxesService.getResponseScale();
      expect(scale).toBeDefined();
      expect(typeof scale.agree).toBe('number');
      expect(typeof scale.disagree).toBe('number');
      expect(typeof scale.unsure).toBe('number');
    });
  });

  describe('getAllTags', () => {
    it('returns sorted array of tags', () => {
      const tags = civicAxesService.getAllTags();
      expect(Array.isArray(tags)).toBe(true);
      // Check sorted
      for (let i = 1; i < tags.length; i++) {
        expect(tags[i] >= tags[i - 1]).toBe(true);
      }
    });
  });
});
