/**
 * FVAP eVAG XML API Client
 *
 * Fetches voter registration deadlines from the Federal Voting Assistance Program.
 * Free, no API key required. Covers all 50 states + DC.
 *
 * Endpoint: https://www.fvap.gov/xml-api/{StateName}/deadline-dates.xml
 */

import { XMLParser } from 'fast-xml-parser';
import { STATE_CODE_TO_NAME } from '../data/stateConstants';

const FVAP_BASE = 'https://www.fvap.gov/xml-api';
const FVAP_TIMEOUT = 10000; // 10s

export interface FvapDeadlines {
  registration_deadline_by_mail?: string;
  registration_deadline_online?: string;
  registration_deadline_in_person?: string;
  election_day_registration?: boolean;
}

/**
 * Fetch and parse FVAP deadline XML for a given state.
 * Returns the raw parsed XML data object.
 */
export async function fetchFvapXml(stateCode: string): Promise<unknown> {
  const stateName = STATE_CODE_TO_NAME[stateCode.toUpperCase()];
  if (!stateName) {
    throw new Error(`Unknown state code: ${stateCode}`);
  }

  // FVAP uses the state name with spaces replaced by hyphens in the URL
  const slug = stateName.replace(/\s+/g, '-');
  const url = `${FVAP_BASE}/${slug}/deadline-dates.xml`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FVAP_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`FVAP API returned ${response.status} for ${stateCode}`);
  }

  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    isArray: (name) => name === 'DeadlineDate' || name === 'Rule',
  });

  return parser.parse(xml);
}

/**
 * Extract General Election registration deadlines from parsed FVAP XML.
 */
export function extractGeneralElectionDeadlines(data: unknown): FvapDeadlines {
  const result: FvapDeadlines = {};

  // Navigate the XML structure: DeadlineDates > DeadlineDate[]
  const root = data as Record<string, unknown>;
  const deadlineDates =
    getNestedArray(root, 'DeadlineDates', 'DeadlineDate') ??
    getNestedArray(root, 'deadlineDates', 'DeadlineDate') ??
    [];

  // Find the General Election entry
  const generalElection = deadlineDates.find((dd: Record<string, unknown>) => {
    const type = String(dd['ElectionType'] ?? dd['electionType'] ?? '');
    return type.toLowerCase().includes('general');
  }) as Record<string, unknown> | undefined;

  if (!generalElection) {
    return result;
  }

  // Get rules array
  const rules: Record<string, unknown>[] =
    (generalElection['Rules'] as Record<string, unknown>)?.['Rule'] as Record<string, unknown>[] ??
    (generalElection['rules'] as Record<string, unknown>)?.['Rule'] as Record<string, unknown>[] ??
    [];

  if (!Array.isArray(rules) || rules.length === 0) {
    // Try single deadline field
    const deadline = String(generalElection['Deadline'] ?? generalElection['deadline'] ?? '');
    if (deadline && deadline !== 'undefined') {
      const normalized = normalizeDeadline(deadline);
      if (normalized) {
        result.registration_deadline_by_mail = normalized;
        result.registration_deadline_online = normalized;
      }
    }
    return result;
  }

  for (const rule of rules) {
    const ruleText = String(rule['RuleDescription'] ?? rule['ruleDescription'] ?? rule['#text'] ?? '');
    const deadline = String(rule['DeadlineDate'] ?? rule['deadlineDate'] ?? rule['Deadline'] ?? rule['deadline'] ?? '');
    const lower = ruleText.toLowerCase();

    const normalized = normalizeDeadline(deadline);

    if (lower.includes('no deadline') || deadline.toLowerCase().includes('no deadline')) {
      result.election_day_registration = true;
      continue;
    }

    if (!normalized) continue;

    if (lower.includes('mail') || lower.includes('postmark')) {
      result.registration_deadline_by_mail = normalized;
    } else if (lower.includes('online') || lower.includes('fax') || lower.includes('electronic')) {
      result.registration_deadline_online = normalized;
    } else if (lower.includes('in person') || lower.includes('in-person')) {
      result.registration_deadline_in_person = normalized;
    } else {
      // Generic rule — use for any field not yet set
      if (!result.registration_deadline_by_mail) result.registration_deadline_by_mail = normalized;
      if (!result.registration_deadline_online) result.registration_deadline_online = normalized;
    }
  }

  return result;
}

/**
 * High-level: fetch + extract deadlines for a state.
 */
export async function fetchFvapDeadlines(stateCode: string): Promise<FvapDeadlines> {
  const data = await fetchFvapXml(stateCode);
  return extractGeneralElectionDeadlines(data);
}

// ── Helpers ──

function getNestedArray(
  obj: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown>[] | null {
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[key];
  }
  if (Array.isArray(current)) return current as Record<string, unknown>[];
  if (current != null && typeof current === 'object') return [current as Record<string, unknown>];
  return null;
}

/**
 * Normalize a deadline string to YYYY-MM-DD format, or return null.
 * Handles "MM/DD/YYYY", "YYYY-MM-DD", and date-like strings.
 */
function normalizeDeadline(raw: string): string | null {
  if (!raw || raw === 'undefined' || raw === 'null') return null;

  const trimmed = raw.trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // MM/DD/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try Date parsing as last resort
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}
