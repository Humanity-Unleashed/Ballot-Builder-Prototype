/**
 * Ballot Module
 *
 * All ballot-related data and functions.
 */

// IDs
export { ELECTION_ID, BALLOT_IDS, CONTEST_IDS, MEASURE_IDS } from './ids';

// Candidates
export { candidatesMayor, candidatesCouncilD5, allCandidates, getCandidateById, getCandidatesByContest } from './candidates';

// Candidate Context (quotes, records, sources)
export {
  allCandidateContext,
  candidateSources,
  getContextByCandidateId,
  getContextByCandidateAndTopic,
  getSourcesByCandidateId,
  getContextByTopic,
  janeSmithContext,
  janeSmithSources,
  johnDoeContext,
  johnDoeSources,
  sarahJohnsonContext,
  sarahJohnsonSources,
  mariaGarciaContext,
  mariaGarciaSources,
  robertChenContext,
  robertChenSources,
} from './candidateContext';

// Contests
export { contests, getContestById, getAllContests } from './contests';

// Measures
export { measures, getMeasureById, getAllMeasures } from './measures';

// Ballot
export {
  sampleBallot,
  ballots,
  getBallotById,
  getBallotByCounty,
  getDefaultBallot,
  getBallotItemById,
  getContestFromBallot,
  getMeasureFromBallot,
  isContest,
  isMeasure,
} from './ballot';
