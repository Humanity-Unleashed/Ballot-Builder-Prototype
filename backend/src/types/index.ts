/**
 * Type Definitions for Ballot Builder API
 */

// ============================================
// Statement Types
// ============================================

export interface Statement {
  id: string;
  text: string;
  category: Category;
  vector: number[];
}

export interface AdaptiveStatement extends Statement {
  round: number;
  agree: string | null;
  disagree: string | null;
  transitionBefore: string | null;
}

export interface AdaptiveFlow {
  start: string;
  [key: string]: AdaptiveStatement | string;
}

// ============================================
// User Types
// ============================================

export interface UserProfile {
  id: string;
  userId: string;
  ageRange: AgeRange | null;
  location: string | null;
  preferenceVector: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDistrict {
  id: string;
  userId: string;
  districtType: DistrictType;
  districtId: string;
  districtName: string | null;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  userId: string;
  statementId: string;
  response: ResponseType;
  respondedAt: string;
}

export interface UserResponseWithStatement extends UserResponse {
  statement: Statement;
}

export interface UserConfidenceArea {
  id: string;
  userId: string;
  issueArea: string;
  confidenceScore: number;
  responseCount: number;
  updatedAt: string;
}

// ============================================
// Enums and Constants
// ============================================

export type Category =
  | 'healthcare'
  | 'environment'
  | 'education'
  | 'economy'
  | 'infrastructure'
  | 'criminal-justice'
  | 'immigration'
  | 'foreign-policy'
  | 'civil-rights'
  | 'technology';

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

export type DistrictType = 'local' | 'county' | 'state_house' | 'state_senate' | 'congressional';

export type ResponseType = 'approve' | 'disapprove';

// ============================================
// API Request/Response Types
// ============================================

export interface GetStatementsOptions {
  limit?: number;
  issueArea?: string | null;
  excludeIds?: string[];
  category?: Category;
}

export interface BlueprintProgress {
  totalResponses: number;
  totalStatements: number;
  completionPercentage: number;
  overallConfidence: number;
  byCategory: Record<Category, number>;
  confidenceAreas: ConfidenceAreaSummary[];
  remainingStatements: number;
}

export interface ConfidenceAreaSummary {
  issueArea: string;
  confidenceScore: number;
  responseCount: number;
}

export interface CategoryStats {
  total: number;
  approve: number;
  disapprove: number;
}

export interface BlueprintSummary {
  totalResponses: number;
  categoryStats: Record<Category, CategoryStats>;
  confidenceAreas: ConfidenceAreaSummary[];
  strongestAreas: string[];
  needsInput: string[];
  recentResponses: RecentResponse[];
}

export interface RecentResponse {
  text: string;
  category: Category;
  response: ResponseType;
  respondedAt: string;
}

export interface NextStatementResult {
  complete: boolean;
  statement?: {
    id: string;
    text: string;
    category: Category;
    vector: number[];
    round: number;
  };
  transitionText?: string | null;
  message?: string;
}

// ============================================
// District Input Types
// ============================================

export interface DistrictInput {
  districtType: DistrictType;
  districtId: string;
  districtName?: string;
}

export interface PreferenceInput {
  issueArea: string;
  importance: number;
}

// ============================================
// Error Types
// ============================================

export interface ApiError extends Error {
  statusCode: number;
  code: string;
}

// ============================================
// Ballot & Election Types
// ============================================

export type County = 'Fulton' | 'Dekalb' | 'Cobb' | 'Gwinnett' | 'Clayton';

export type Jurisdiction = 'federal' | 'state' | 'county' | 'city' | 'special_district';

export interface Ballot {
  id: string;
  electionDate: string; // ISO date string
  electionType?: string; // e.g., "General Election"
  state: string;
  county: County;
  items: BallotItem[]; // Can be Contest or Measure
}

export type BallotItemType = 'candidate' | 'measure';

export interface Contest {
  id: string;
  type: 'candidate';
  office: string; // e.g., "Governor"
  jurisdiction: Jurisdiction;
  termInfo?: string;
  votingFor?: number; // e.g., 1 for "vote for one"
  candidates: Candidate[];
}

export interface Measure {
  id: string;
  type: 'measure';
  title: string; // e.g., "Proposition 42: Education Funding Act"
  shortTitle: string; // e.g., "Prop 42"
  description: string;
  vector?: number[]; // Legacy policy alignment vector (deprecated)
  /** Axis effects: how YES vote affects each axis. Negative = toward poleA, Positive = toward poleB */
  yesAxisEffects?: Record<string, number>;
  /** Which axes are relevant for this measure */
  relevantAxes?: string[];
  outcomes: {
    yes: string;
    no: string;
  };
  explanation: string;
  supporters: string[];
  opponents: string[];
}

export type BallotItem = Contest | Measure;

// ============================================
// Candidate Types
// ============================================

export type Party = 'Democratic' | 'Republican' | 'Independent' | 'Nonpartisan' | 'Libertarian' | 'Other' | 'Unknown';

export type IncumbencyStatus = 'incumbent' | 'challenger' | 'open-seat' | 'unknown';

export type ContextType = 'speech' | 'voting_record' | 'platform' | 'news' | 'interview' | 'social_media';

export interface CandidateName {
  full: string;
  ballotDisplay: string;
}

export interface Candidate {
  id: string;
  electionId?: string;
  contestId: string;
  name: CandidateName;
  party: Party;
  incumbencyStatus?: IncumbencyStatus;
  isWriteIn?: boolean;
  ballotOrder?: number;
  description?: string;
  vector?: number[]; // Legacy policy alignment vector (deprecated)
  positions?: string[]; // Key policy positions
  /** Axis-based stances: axisId -> value (0-10 scale, where 0=poleA, 10=poleB) */
  axisStances?: Record<string, number>;
  /** Summary of candidate's policy profile */
  profileSummary?: string;
  policyProfile?: CandidatePreferenceItem[];
}

export interface CandidateContext {
  id: string;
  candidateId: string;
  topicId: PolicyTopicId[];
  content: string; // The actual quote or record
  type: ContextType;
  date?: string;
  sourceUrl?: string;
}

// ============================================
// Policy Topic Types
// ============================================

export type PolicyTopicId = 'housing' | 'economy' | 'climate' | 'education' | 'healthcare';

export interface PolicyTopic {
  id: PolicyTopicId;
  label: string;
  description: string;
  leftAxisLabel?: string; // e.g., "More Regulation/Public Support"
  rightAxisLabel?: string; // e.g., "Deregulation/Market Based"
}

// ============================================
// Persona Types (Test Users)
// ============================================

export type IncomeLevel = 'low' | 'medium' | 'high';

export type Gender = 'male' | 'female' | 'nonbinary' | 'other' | 'prefer_not_to_say';

export interface Persona {
  id: string;
  name: string;
  county: County;
  city?: string;
  age: number;
  incomeLevel: IncomeLevel;
  gender: Gender;
  story: string;
}

// ============================================
// Preference Types
// ============================================

export type Stance = 'support' | 'against' | 'mixed' | 'unknown';

export interface PreferenceItemBase {
  topicId: PolicyTopicId;
  topicLabel: string;
  stance: Stance;
  importance?: number; // 1-5
  intensity?: number; // -1 to +1 (-1 strongly oppose, +1 strongly support)
}

export interface UserPreferenceItem extends PreferenceItemBase {}

export interface CandidatePreferenceItem extends PreferenceItemBase {
  summary?: string;
  sources?: SourceRef[];
}

export interface UserPreference {
  personaId?: string;
  items: UserPreferenceItem[];
}

// ============================================
// Recommendation & Alignment Types
// ============================================

export type Confidence = 'low' | 'medium' | 'high';

export interface SourceRef {
  title: string;
  url?: string;
  content: string;
}

export interface CandidateMatch {
  id: string;
  ballotId: string;
  contestId: string;
  personaId: string;
  candidateId: string;
  overallScore: number; // 0-1
  summary?: string;
  confidence?: Confidence;
  sources: SourceRef[];
  generatedAt?: string;
}

export interface ContestRecommendation {
  id: string;
  ballotId: string;
  contestId: string;
  personaId: string;
  preferredCandidateId: string;
  summary: string; // Why this candidate and not others
  confidence: Confidence;
  sources: SourceRef[];
  generatedAt?: string;
}

export interface MockRecommendation {
  contestId: string;
  recommendedCandidateId: string;
  confidence: number; // 0-100
  confidenceLevel: Confidence;
  summary: string;
}

// ============================================
// Civic Axes Types
// ============================================

export type GovernmentLevel = 'local' | 'state' | 'national' | 'international' | 'general';

export type SwipeResponse = 'strong_disagree' | 'disagree' | 'agree' | 'strong_agree' | 'unsure';

export interface AxisPole {
  label: string;
  interpretation: string;
}

export interface CivicAxis {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  poleA: AxisPole;
  poleB: AxisPole;
  recommended_cards_per_session: number;
}

export interface CivicDomain {
  id: string;
  name: string;
  why: string;
  axes: string[];
  ballot_mapping_examples: Record<string, string[]>;
}

export interface CivicItem {
  id: string;
  text: string;
  axis_keys: Record<string, 1 | -1>;
  level: GovernmentLevel;
  tags: string[];
  tradeoff: string | null;
}

export interface CivicAxesScoring {
  axis_range: [number, number];
  normalize_by_max: boolean;
  shrinkage_k: number;
  unsure_treatment: string;
  confidence_heuristic: string;
}

export interface CivicAxesSpec {
  spec_version: string;
  generated_at_utc: string;
  app: { name: string; notes: string[] };
  response_scale: Record<SwipeResponse, number>;
  scoring: CivicAxesScoring;
  domains: CivicDomain[];
  axes: CivicAxis[];
  items: CivicItem[];
}

// ============================================
// Blueprint Profile Types
// ============================================

export type ProfileSource = 'learned_from_swipes' | 'user_edited' | 'default';

export type LearningMode = 'normal' | 'dampened' | 'frozen';

export interface AxisEvidence {
  n_items_answered: number;
  n_unsure: number;
  top_driver_item_ids: string[];
}

export interface AxisEstimates {
  /** Raw learned score from swipes, range [-1, 1] */
  learned_score: number;
  /** Mapped to 0-10 scale as float before rounding */
  learned_value_float: number;
}

export interface AxisProfile {
  axis_id: string;
  /** Displayed value, 0-10 discrete */
  value_0_10: number;
  /** Where this value came from */
  source: ProfileSource;
  /** Confidence level 0-1 */
  confidence_0_1: number;
  /** Whether user has locked this axis */
  locked: boolean;
  /** How future swipes affect this value */
  learning_mode: LearningMode;
  /** Raw estimates from swipes */
  estimates: AxisEstimates;
  /** Evidence for transparency */
  evidence: AxisEvidence;
}

export interface DomainImportance {
  /** Importance value 0-10 */
  value_0_10: number;
  /** Where this value came from */
  source: ProfileSource;
  /** Confidence level 0-1 */
  confidence_0_1: number;
  /** Last time this was updated */
  last_updated_at: string;
}

export interface DomainProfile {
  domain_id: string;
  importance: DomainImportance;
  axes: AxisProfile[];
}

export interface BlueprintProfile {
  profile_version: string;
  user_id: string;
  updated_at: string;
  domains: DomainProfile[];
}

// Swipe event for tracking user responses
export interface SwipeEvent {
  item_id: string;
  response: SwipeResponse;
  timestamp: string;
}

// Axis score result from scoring function
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

// ============================================
// Assessment Session Types
// ============================================

export type AssessmentStatus = 'in_progress' | 'completed' | 'abandoned';

export interface AssessmentProgress {
  questionsAnswered: number;
  estimatedTotal: number;
  percentage: number;
  dominantStrategy: string;
}

export interface AdaptiveState {
  answeredItems: string[];
  axisScores: Record<string, AxisScore>;
  domainCoverage: Record<string, number>;
  totalQuestions: number;
  selectedDomains: string[];
}

export interface AssessmentSession {
  id: string;
  userId?: string;
  status: AssessmentStatus;
  selectedDomains: string[];
  adaptiveState: AdaptiveState;
  swipes: SwipeEvent[];
  currentItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartAssessmentRequest {
  selectedDomains?: string[];
  userId?: string;
}

export interface StartAssessmentResponse {
  sessionId: string;
  firstQuestion: CivicItem;
  progress: AssessmentProgress;
  selectedDomains: string[];
}

export interface SubmitAnswerRequest {
  itemId: string;
  response: SwipeResponse;
}

export interface SubmitAnswerResponse {
  nextQuestion: CivicItem | null;
  scores: AxisScore[];
  progress: AssessmentProgress;
  isComplete: boolean;
}

export interface GetSessionResponse {
  sessionId: string;
  status: AssessmentStatus;
  currentQuestion: CivicItem | null;
  answeredItems: string[];
  scores: AxisScore[];
  progress: AssessmentProgress;
  selectedDomains: string[];
}

export interface CompleteAssessmentRequest {
  saveToProfile?: boolean;
}

export interface CompleteAssessmentResponse {
  sessionId: string;
  finalScores: AxisScore[];
  profileSaved: boolean;
}
