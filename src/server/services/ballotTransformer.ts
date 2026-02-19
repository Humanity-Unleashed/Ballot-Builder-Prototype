/**
 * Ballot Transformer
 *
 * Converts Ballotpedia API responses into the internal Ballot type
 * used by the UI layer, so no frontend changes are needed.
 */

import { createHash } from 'crypto';
import type {
  BallotpediaElection,
  BallotpediaRace,
  BallotpediaCandidate,
  BallotpediaMeasure,
  DistrictInfo,
} from '../types/externalApis';
import type {
  Ballot,
  Contest,
  Measure,
  Candidate,
  Jurisdiction,
  Party,
} from '../types';

/**
 * Compute a SHA-256 hash from OCD division IDs for cache keying.
 */
export function computeDistrictHash(districtInfo: DistrictInfo): string {
  const sorted = [...districtInfo.ocdDivisionIds].sort();
  const input = sorted.join('|');
  return createHash('sha256').update(input).digest('hex').slice(0, 32);
}

/**
 * Map Ballotpedia office_level to our Jurisdiction type.
 */
export function mapJurisdiction(officeLevel: string): Jurisdiction {
  const level = officeLevel.toLowerCase();
  if (level.includes('federal') || level.includes('national')) return 'federal';
  if (level.includes('state')) return 'state';
  if (level.includes('county')) return 'county';
  if (level.includes('city') || level.includes('municipal') || level.includes('local')) return 'city';
  if (level.includes('special') || level.includes('district')) return 'special_district';
  return 'state';
}

/**
 * Map Ballotpedia party string to our Party type.
 */
export function mapParty(party?: string): Party {
  if (!party) return 'Unknown';
  const p = party.toLowerCase();
  if (p.includes('democrat')) return 'Democratic';
  if (p.includes('republican')) return 'Republican';
  if (p.includes('libertarian')) return 'Libertarian';
  if (p.includes('independent') || p.includes('no party')) return 'Independent';
  if (p.includes('nonpartisan')) return 'Nonpartisan';
  return 'Other';
}

/**
 * Transform a Ballotpedia candidate into our Candidate type.
 */
function transformCandidate(
  bpCandidate: BallotpediaCandidate,
  contestId: string,
  index: number,
): Candidate {
  return {
    id: `bp-candidate-${bpCandidate.id}`,
    contestId,
    name: {
      full: bpCandidate.name,
      ballotDisplay: bpCandidate.name,
    },
    party: mapParty(bpCandidate.party),
    incumbencyStatus: bpCandidate.is_incumbent ? 'incumbent' : 'challenger',
    ballotOrder: index + 1,
  };
}

/**
 * Transform a Ballotpedia race into our Contest type.
 */
function transformRace(race: BallotpediaRace): Contest {
  const contestId = `bp-contest-${race.id}`;
  return {
    id: contestId,
    type: 'candidate',
    office: race.office,
    jurisdiction: mapJurisdiction(race.office_level),
    votingFor: 1,
    candidates: race.candidates.map((c, i) => transformCandidate(c, contestId, i)),
  };
}

/**
 * Transform a Ballotpedia measure into our Measure type.
 */
function transformMeasure(bpMeasure: BallotpediaMeasure): Measure {
  return {
    id: `bp-measure-${bpMeasure.id}`,
    type: 'measure',
    title: bpMeasure.title,
    shortTitle: bpMeasure.title.length > 40
      ? bpMeasure.title.slice(0, 37) + '...'
      : bpMeasure.title,
    description: bpMeasure.description ?? '',
    outcomes: {
      yes: bpMeasure.yes_vote ?? 'Approves the measure',
      no: bpMeasure.no_vote ?? 'Rejects the measure',
    },
    explanation: bpMeasure.description ?? '',
    supporters: [],
    opponents: [],
  };
}

/**
 * Transform a full Ballotpedia election response into our Ballot type.
 */
export function transformBallotpediaElection(
  election: BallotpediaElection,
  districtInfo: DistrictInfo,
): Ballot {
  const contests = election.races.map(transformRace);
  const measures = election.measures.map(transformMeasure);

  return {
    id: `bp-ballot-${election.id}`,
    electionDate: election.date,
    electionType: election.type ?? 'Election',
    state: districtInfo.state,
    county: districtInfo.county ?? '',
    items: [...contests, ...measures],
  };
}
