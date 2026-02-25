import axios from 'axios';
import type {
  Spec,
  Domain,
  Axis,
  Item,
  SwipeResponse,
} from '../types/civicAssessment';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PolicyStatement {
  id: string;
  statementText: string;
  issueArea: string;
  specificityLevel: string;
}

export const blueprintApi = {
  async getStatements(): Promise<PolicyStatement[]> {
    const response = await api.get<{ statements: PolicyStatement[] }>(
      '/blueprint/statements',
    );
    return response.data.statements;
  },

  async submitResponse(
    statementId: string,
    response: 'approve' | 'disapprove',
  ): Promise<void> {
    await api.post('/blueprint/response', { statementId, response });
  },

  async getProgress(): Promise<{
    totalAnswered: number;
    byCategory: Record<string, number>;
  }> {
    const response = await api.get('/blueprint/progress');
    return response.data;
  },
};

export interface AxisScore {
  axis_id: string;
  raw_sum: number;
  n_answered: number;
  n_unsure: number;
  normalized: number;
  shrunk: number;
  confidence: number;
  top_drivers: string[];
}

export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
}

export interface ScoreResponse {
  scores: AxisScore[];
  scoringConfig: {
    axis_range: [number, number];
    normalize_by_max: boolean;
    shrinkage_k: number;
    unsure_treatment: string;
    confidence_heuristic: string;
  };
}

export interface SessionResponse {
  items: Item[];
  count: number;
  responseScale: Record<SwipeResponse, number>;
}

export const civicAxesApi = {
  async getSpec(): Promise<Spec> {
    const response = await api.get<Spec>('/civic-axes/spec');
    return response.data;
  },

  async getSummary(): Promise<{
    version: string;
    domainCount: number;
    axisCount: number;
    itemCount: number;
    domains: Array<{ id: string; name: string; axisCount: number }>;
  }> {
    const response = await api.get('/civic-axes/summary');
    return response.data;
  },

  async getDomains(): Promise<{ domains: Domain[]; count: number }> {
    const response = await api.get('/civic-axes/domains');
    return response.data;
  },

  async getDomain(domainId: string): Promise<{ domain: Domain; axes: Axis[] }> {
    const response = await api.get(`/civic-axes/domains/${domainId}`);
    return response.data;
  },

  async getAxes(): Promise<{ axes: Axis[]; count: number }> {
    const response = await api.get('/civic-axes/axes');
    return response.data;
  },

  async getAxis(axisId: string): Promise<Axis> {
    const response = await api.get(`/civic-axes/axes/${axisId}`);
    return response.data;
  },

  async getSessionItems(options?: {
    count?: number;
    level?: string;
    excludeIds?: string[];
  }): Promise<SessionResponse> {
    const params = new URLSearchParams();
    if (options?.count) params.append('count', options.count.toString());
    if (options?.level) params.append('level', options.level);
    if (options?.excludeIds?.length)
      params.append('excludeIds', options.excludeIds.join(','));

    const response = await api.get<SessionResponse>(
      `/civic-axes/session?${params}`,
    );
    return response.data;
  },

  async getItems(options?: {
    level?: string;
    tag?: string;
    axisId?: string;
  }): Promise<{ items: Item[]; count: number }> {
    const params = new URLSearchParams();
    if (options?.level) params.append('level', options.level);
    if (options?.tag) params.append('tag', options.tag);
    if (options?.axisId) params.append('axisId', options.axisId);

    const response = await api.get(`/civic-axes/items?${params}`);
    return response.data;
  },

  async scoreResponses(responses: SwipeEvent[]): Promise<ScoreResponse> {
    const response = await api.post<ScoreResponse>('/civic-axes/score', {
      responses,
    });
    return response.data;
  },

  async getResponseScale(): Promise<Record<SwipeResponse, number>> {
    const response = await api.get('/civic-axes/response-scale');
    return response.data;
  },

  async getTags(): Promise<{ tags: string[]; count: number }> {
    const response = await api.get('/civic-axes/tags');
    return response.data;
  },
};

export interface Persona {
  id: string;
  name: string;
  county: string;
  city?: string;
  age: number;
  incomeLevel: 'low' | 'medium' | 'high';
  gender: 'male' | 'female' | 'nonbinary' | 'other' | 'prefer_not_to_say';
  story: string;
}

export interface PersonaPreferences {
  personaId: string;
  items: Array<{
    topicId: string;
    topicLabel: string;
    stance: 'support' | 'against' | 'mixed' | 'unknown';
    importance?: number;
    intensity?: number;
  }>;
}

export const personaApi = {
  async getAll(): Promise<Persona[]> {
    const response = await api.get<{ personas: Persona[] }>('/personas');
    return response.data.personas;
  },

  async getById(id: string): Promise<Persona> {
    const response = await api.get<{ persona: Persona }>(`/personas/${id}`);
    return response.data.persona;
  },

  async getPreferences(id: string): Promise<PersonaPreferences> {
    const response = await api.get<{ preferences: PersonaPreferences }>(
      `/personas/${id}/preferences`,
    );
    return response.data.preferences;
  },
};

export interface Statement {
  id: string;
  text: string;
  category: string;
  vector: number[];
}

export const statementsApi = {
  async getAll(options?: {
    limit?: number;
    excludeIds?: string[];
  }): Promise<Statement[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.excludeIds?.length)
      params.append('excludeIds', options.excludeIds.join(','));

    const response = await api.get<{ statements: Statement[] }>(
      `/blueprint/statements?${params}`,
    );
    return response.data.statements;
  },
};

export interface AdaptiveStatement {
  id: string;
  text: string;
  category: string;
  vector: number[];
  round: number;
  transitionText?: string | null;
}

export interface AdaptiveFlowResult {
  complete: boolean;
  statement?: AdaptiveStatement;
  transitionText?: string | null;
  message?: string;
}

export const adaptiveFlowApi = {
  async getStart(): Promise<AdaptiveFlowResult> {
    const response = await api.get<AdaptiveFlowResult>('/blueprint/start');
    return response.data;
  },

  async getNext(
    currentStatementId: string,
    response: 'approve' | 'disapprove',
  ): Promise<AdaptiveFlowResult> {
    const params = new URLSearchParams();
    params.append('currentStatementId', currentStatementId);
    params.append('response', response);

    const res = await api.get<AdaptiveFlowResult>(`/blueprint/next?${params}`);
    return res.data;
  },
};

export interface CandidateName {
  full: string;
  ballotDisplay: string;
}

export interface BallotCandidate {
  id: string;
  contestId: string;
  name: CandidateName;
  party: string;
  incumbencyStatus?: string;
  ballotOrder?: number;
  description?: string;
  vector?: number[];
  positions?: string[];
  axisStances?: Record<string, number>;
  valueStances?: Record<string, number>;
  profileSummary?: string;
}

export interface BallotContest {
  id: string;
  type: 'candidate';
  office: string;
  jurisdiction?: string;
  termInfo?: string;
  votingFor?: number;
  candidates: BallotCandidate[];
}

export interface BallotMeasure {
  id: string;
  type: 'measure';
  title: string;
  shortTitle: string;
  description: string;
  vector?: number[];
  yesAxisEffects?: Record<string, number>;
  yesValueEffects?: Record<string, number>;
  relevantAxes?: string[];
  outcomes: {
    yes: string;
    no: string;
  };
  explanation: string;
  supporters: string[];
  opponents: string[];
}

export type BallotItem = BallotContest | BallotMeasure;

export interface Ballot {
  id: string;
  electionDate: string;
  electionType?: string;
  state: string;
  county: string;
  items: BallotItem[];
}

export interface BallotSummary {
  id: string;
  electionDate: string;
  electionType: string;
  state: string;
  county: string;
  contestCount: number;
  measureCount: number;
  totalItems: number;
}

export interface Representative {
  id: string;
  name: string;
  phone: string;
  photoURL?: string;
  party: string;
  state: string;
  district?: string;
  reason: string;
  area: string;
  url?: string;
}

export interface BallotLookupResponse {
  ballot: Ballot;
  source: string;
  fetchedAt?: string;
  location?: { state: string; stateName: string; city?: string };
  voterInfo?: {
    registrationUrl?: string;
    absenteeBallotUrl?: string;
    pollingPlaceUrl?: string;
    stateRules?: {
      state_code: string;
      state_name: string;
      registration_deadline_in_person?: string;
      registration_deadline_by_mail?: string;
      registration_deadline_online?: string;
      id_requirements_to_vote?: string;
      absentee_ballot_rules?: string;
      early_voting_starts?: string;
      early_voting_ends?: string;
      voter_registration_url?: string;
      absentee_ballot_url?: string;
      polling_place_url?: string;
    };
  } | null;
  representatives?: Representative[] | null;
}

export const ballotApi = {
  async getByZipcode(zipcode: string): Promise<BallotLookupResponse> {
    const response = await api.get<BallotLookupResponse>('/ballot/by-zipcode', {
      params: { zipcode },
    });
    return response.data;
  },

  async getDefault(): Promise<Ballot> {
    const response = await api.get<Ballot>('/ballot');
    return response.data;
  },

  async getById(ballotId: string): Promise<Ballot> {
    const response = await api.get<Ballot>(`/ballot/${ballotId}`);
    return response.data;
  },

  async getAll(): Promise<Ballot[]> {
    const response = await api.get<Ballot[]>('/ballot/all');
    return response.data;
  },

  async getSummary(): Promise<{
    ballotCount: number;
    contestCount: number;
    measureCount: number;
    candidateCount: number;
  }> {
    const response = await api.get('/ballot/summary');
    return response.data;
  },

  async getBallotSummary(ballotId: string): Promise<BallotSummary> {
    const response = await api.get<BallotSummary>(
      `/ballot/${ballotId}/summary`,
    );
    return response.data;
  },

  async getContests(ballotId: string): Promise<BallotContest[]> {
    const response = await api.get<BallotContest[]>(
      `/ballot/${ballotId}/contests`,
    );
    return response.data;
  },

  async getMeasures(ballotId: string): Promise<BallotMeasure[]> {
    const response = await api.get<BallotMeasure[]>(
      `/ballot/${ballotId}/measures`,
    );
    return response.data;
  },
};

export const contestApi = {
  async getAll(): Promise<BallotContest[]> {
    const response = await api.get<BallotContest[]>('/contests');
    return response.data;
  },

  async getById(contestId: string): Promise<BallotContest> {
    const response = await api.get<BallotContest>(`/contests/${contestId}`);
    return response.data;
  },

  async getCandidates(contestId: string): Promise<BallotCandidate[]> {
    const response = await api.get<BallotCandidate[]>(
      `/contests/${contestId}/candidates`,
    );
    return response.data;
  },
};

export const measureApi = {
  async getAll(): Promise<BallotMeasure[]> {
    const response = await api.get<BallotMeasure[]>('/measures');
    return response.data;
  },

  async getById(measureId: string): Promise<BallotMeasure> {
    const response = await api.get<BallotMeasure>(`/measures/${measureId}`);
    return response.data;
  },
};

export const candidateApi = {
  async getAll(contestId?: string): Promise<BallotCandidate[]> {
    const params = contestId ? { contestId } : {};
    const response = await api.get<BallotCandidate[]>('/candidates', {
      params,
    });
    return response.data;
  },

  async getById(
    candidateId: string,
  ): Promise<BallotCandidate & { context?: unknown[]; sources?: unknown[] }> {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },
};

// ────────────────────────────────────────
// Schwartz Values API
// ────────────────────────────────────────

export interface SchwartzValue {
  id: string;
  name: string;
  schwartzName: string;
  description: string;
  dimension: string;
  oppositeValue: string;
}

export interface SchwartzDimension {
  id: string;
  name: string;
  schwartzName: string;
  description: string;
  values: string[];
  oppositeDimension: string;
}

export interface SchwartzAssessmentItem {
  id: string;
  text: string;
  valueId: string;
  weight: number;
  reversed: boolean;
}

export interface SchwartzVignetteOption {
  id: string;
  text: string;
  valueId: string;
}

export interface SchwartzVignette {
  id: string;
  scenario: string;
  options: SchwartzVignetteOption[];
}

export interface SchwartzSpec {
  spec_version: string;
  generated_at_utc: string;
  scoring: {
    value_range: [number, number];
    use_ipsatization: boolean;
    ipsatization_note: string;
  };
  dimensions: SchwartzDimension[];
  values: SchwartzValue[];
  vignettes: SchwartzVignette[];
}

export interface SchwartzVignetteResponse {
  vignette_id: string;
  selected_option_id: string;
}

export interface SchwartzItemResponse {
  item_id: string;
  response: 1 | 2 | 3 | 4 | 5;
}

export interface SchwartzValueScore {
  value_id: string;
  name: string;
  raw_mean: number;
  ipsatized: number;
  n_answered: number;
  dimension_id: string;
}

export interface SchwartzDimensionScore {
  dimension_id: string;
  name: string;
  raw_mean: number;
  ipsatized: number;
  values: string[];
}

export interface SchwartzScoringResult {
  values: SchwartzValueScore[];
  dimensions: SchwartzDimensionScore[];
  individual_mean: number;
}

export interface BoosterSetMeta {
  id: string;
  version: number;
  title: string;
  description: string;
  itemCount: number;
}

export interface BoosterSet {
  id: string;
  version: number;
  title: string;
  description: string;
  items: SchwartzAssessmentItem[];
}

export const schwartzApi = {
  async getSpec(): Promise<SchwartzSpec> {
    const response = await api.get<SchwartzSpec>('/schwartz-values/spec');
    return response.data;
  },

  async getVignettes(randomize: boolean = true): Promise<{ vignettes: SchwartzVignette[] }> {
    const response = await api.get<{ vignettes: SchwartzVignette[] }>(
      `/schwartz-values/items?randomize=${randomize}`
    );
    return response.data;
  },

  async scoreResponses(
    vignetteResponses: SchwartzVignetteResponse[],
    boosterResponses?: SchwartzItemResponse[],
  ): Promise<SchwartzScoringResult> {
    const response = await api.post<SchwartzScoringResult>('/schwartz-values/score', {
      vignetteResponses,
      boosterResponses,
    });
    return response.data;
  },

  async getBoosters(): Promise<BoosterSetMeta[]> {
    const response = await api.get<{ boosters: BoosterSetMeta[] }>('/schwartz-values/boosters');
    return response.data.boosters;
  },

  async getBooster(id: string): Promise<BoosterSet> {
    const response = await api.get<BoosterSet>(`/schwartz-values/boosters?id=${id}`);
    return response.data;
  },
};

export default api;
