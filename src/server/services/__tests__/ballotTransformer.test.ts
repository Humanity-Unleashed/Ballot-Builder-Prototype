import { describe, it, expect } from 'vitest';
import {
  computeDistrictHash,
  mapJurisdiction,
  mapParty,
  transformBallotpediaElection,
} from '../ballotTransformer';
import type {
  BallotpediaElection,
  DistrictInfo,
} from '../../types/externalApis';

describe('ballotTransformer', () => {
  describe('computeDistrictHash', () => {
    it('produces a consistent hash from OCD division IDs', () => {
      const districtInfo: DistrictInfo = {
        state: 'MI',
        ocdDivisionIds: [
          'ocd-division/country:us/state:mi',
          'ocd-division/country:us/state:mi/county:wayne',
          'ocd-division/country:us/state:mi/place:detroit',
        ],
      };

      const hash1 = computeDistrictHash(districtInfo);
      const hash2 = computeDistrictHash(districtInfo);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32);
    });

    it('produces the same hash regardless of division ID order', () => {
      const d1: DistrictInfo = {
        state: 'MI',
        ocdDivisionIds: ['ocd-division/country:us', 'ocd-division/country:us/state:mi'],
      };
      const d2: DistrictInfo = {
        state: 'MI',
        ocdDivisionIds: ['ocd-division/country:us/state:mi', 'ocd-division/country:us'],
      };

      expect(computeDistrictHash(d1)).toBe(computeDistrictHash(d2));
    });

    it('produces different hashes for different districts', () => {
      const d1: DistrictInfo = {
        state: 'MI',
        ocdDivisionIds: ['ocd-division/country:us/state:mi'],
      };
      const d2: DistrictInfo = {
        state: 'OH',
        ocdDivisionIds: ['ocd-division/country:us/state:oh'],
      };

      expect(computeDistrictHash(d1)).not.toBe(computeDistrictHash(d2));
    });
  });

  describe('mapJurisdiction', () => {
    it('maps federal levels', () => {
      expect(mapJurisdiction('Federal')).toBe('federal');
      expect(mapJurisdiction('National')).toBe('federal');
    });

    it('maps state level', () => {
      expect(mapJurisdiction('State')).toBe('state');
    });

    it('maps county level', () => {
      expect(mapJurisdiction('County')).toBe('county');
    });

    it('maps city/municipal levels', () => {
      expect(mapJurisdiction('City')).toBe('city');
      expect(mapJurisdiction('Municipal')).toBe('city');
      expect(mapJurisdiction('Local')).toBe('city');
    });

    it('maps special district', () => {
      expect(mapJurisdiction('Special District')).toBe('special_district');
    });

    it('defaults to state for unknown levels', () => {
      expect(mapJurisdiction('unknown')).toBe('state');
    });
  });

  describe('mapParty', () => {
    it('maps known parties', () => {
      expect(mapParty('Democratic')).toBe('Democratic');
      expect(mapParty('Democrat')).toBe('Democratic');
      expect(mapParty('Republican')).toBe('Republican');
      expect(mapParty('Libertarian')).toBe('Libertarian');
      expect(mapParty('Independent')).toBe('Independent');
      expect(mapParty('No Party Preference')).toBe('Independent');
      expect(mapParty('Nonpartisan')).toBe('Nonpartisan');
    });

    it('returns Unknown for undefined/null', () => {
      expect(mapParty(undefined)).toBe('Unknown');
    });

    it('returns Other for unrecognized parties', () => {
      expect(mapParty('Green')).toBe('Other');
    });
  });

  describe('transformBallotpediaElection', () => {
    const sampleElection: BallotpediaElection = {
      id: 100,
      date: '2026-11-03',
      type: 'General Election',
      races: [
        {
          id: 200,
          office: 'Governor',
          office_level: 'State',
          candidates: [
            { id: 1, name: 'Alice Johnson', party: 'Democratic', is_incumbent: true },
            { id: 2, name: 'Bob Smith', party: 'Republican', is_incumbent: false },
          ],
        },
        {
          id: 201,
          office: 'U.S. Representative',
          office_level: 'Federal',
          candidates: [
            { id: 3, name: 'Carol Davis', party: 'Democratic' },
          ],
        },
      ],
      measures: [
        {
          id: 300,
          title: 'Proposition 1: Infrastructure Bond',
          description: 'Authorizes $5 billion in bonds for infrastructure.',
          yes_vote: 'Approves the bond measure',
          no_vote: 'Rejects the bond measure',
        },
      ],
    };

    const districtInfo: DistrictInfo = {
      state: 'MI',
      county: 'Wayne',
      city: 'Detroit',
      ocdDivisionIds: [
        'ocd-division/country:us/state:mi',
        'ocd-division/country:us/state:mi/county:wayne',
      ],
    };

    it('produces a valid Ballot object', () => {
      const ballot = transformBallotpediaElection(sampleElection, districtInfo);

      expect(ballot.id).toBe('bp-ballot-100');
      expect(ballot.electionDate).toBe('2026-11-03');
      expect(ballot.electionType).toBe('General Election');
      expect(ballot.state).toBe('MI');
      expect(ballot.county).toBe('Wayne');
    });

    it('transforms races into contests with candidates', () => {
      const ballot = transformBallotpediaElection(sampleElection, districtInfo);

      const contests = ballot.items.filter((item) => item.type === 'candidate');
      expect(contests).toHaveLength(2);

      const governor = contests[0] as import('../../types').Contest;
      expect(governor.office).toBe('Governor');
      expect(governor.jurisdiction).toBe('state');
      expect(governor.candidates).toHaveLength(2);
      expect(governor.candidates[0].name.full).toBe('Alice Johnson');
      expect(governor.candidates[0].party).toBe('Democratic');
      expect(governor.candidates[0].incumbencyStatus).toBe('incumbent');
      expect(governor.candidates[1].incumbencyStatus).toBe('challenger');

      const usRep = contests[1] as import('../../types').Contest;
      expect(usRep.jurisdiction).toBe('federal');
    });

    it('transforms measures', () => {
      const ballot = transformBallotpediaElection(sampleElection, districtInfo);

      const measures = ballot.items.filter((item) => item.type === 'measure');
      expect(measures).toHaveLength(1);

      const measure = measures[0] as import('../../types').Measure;
      expect(measure.title).toBe('Proposition 1: Infrastructure Bond');
      expect(measure.outcomes.yes).toBe('Approves the bond measure');
      expect(measure.outcomes.no).toBe('Rejects the bond measure');
    });

    it('truncates long measure titles in shortTitle', () => {
      const longElection: BallotpediaElection = {
        id: 101,
        date: '2026-11-03',
        type: 'General',
        races: [],
        measures: [
          {
            id: 400,
            title: 'A Very Long Measure Title That Exceeds Forty Characters Easily',
          },
        ],
      };

      const ballot = transformBallotpediaElection(longElection, districtInfo);
      const measure = ballot.items[0] as import('../../types').Measure;
      expect(measure.shortTitle.length).toBeLessThanOrEqual(40);
      expect(measure.shortTitle).toContain('...');
    });

    it('handles election with no races and no measures', () => {
      const emptyElection: BallotpediaElection = {
        id: 102,
        date: '2026-11-03',
        type: 'Special',
        races: [],
        measures: [],
      };

      const ballot = transformBallotpediaElection(emptyElection, districtInfo);
      expect(ballot.items).toHaveLength(0);
    });
  });
});
