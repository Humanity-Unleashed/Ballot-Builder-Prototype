import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractGeneralElectionDeadlines, fetchFvapDeadlines } from '../fvapClient';

// Mock global fetch for fetchFvapDeadlines
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractGeneralElectionDeadlines', () => {
  it('extracts mail and online deadlines from rules', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'General Election',
            Rules: {
              Rule: [
                { RuleDescription: 'Registration by Mail', DeadlineDate: '10/19/2026' },
                { RuleDescription: 'Online Registration', DeadlineDate: '10/19/2026' },
              ],
            },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result.registration_deadline_by_mail).toBe('2026-10-19');
    expect(result.registration_deadline_online).toBe('2026-10-19');
  });

  it('handles single generic rule (fills both mail and online)', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'General Election',
            Rules: {
              Rule: [
                { RuleDescription: 'Voter Registration Deadline', DeadlineDate: '2026-10-05' },
              ],
            },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result.registration_deadline_by_mail).toBe('2026-10-05');
    expect(result.registration_deadline_online).toBe('2026-10-05');
  });

  it('detects election day registration ("No Deadline")', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'General Election',
            Rules: {
              Rule: [
                { RuleDescription: 'No Deadline', DeadlineDate: 'No Deadline' },
              ],
            },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result.election_day_registration).toBe(true);
  });

  it('handles in-person rules', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'General Election',
            Rules: {
              Rule: [
                { RuleDescription: 'In Person Registration', DeadlineDate: '11/03/2026' },
                { RuleDescription: 'Registration by Mail', DeadlineDate: '10/19/2026' },
              ],
            },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result.registration_deadline_in_person).toBe('2026-11-03');
    expect(result.registration_deadline_by_mail).toBe('2026-10-19');
  });

  it('returns empty object when no General Election found', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'Primary Election',
            Rules: { Rule: [{ RuleDescription: 'Mail', DeadlineDate: '05/01/2026' }] },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result).toEqual({});
  });

  it('handles empty/missing data gracefully', () => {
    expect(extractGeneralElectionDeadlines({})).toEqual({});
    expect(extractGeneralElectionDeadlines({ DeadlineDates: {} })).toEqual({});
  });

  it('normalizes MM/DD/YYYY to YYYY-MM-DD', () => {
    const data = {
      DeadlineDates: {
        DeadlineDate: [
          {
            ElectionType: 'General Election',
            Rules: {
              Rule: [
                { RuleDescription: 'Postmark deadline', DeadlineDate: '1/5/2026' },
              ],
            },
          },
        ],
      },
    };

    const result = extractGeneralElectionDeadlines(data);
    expect(result.registration_deadline_by_mail).toBe('2026-01-05');
  });
});

describe('fetchFvapDeadlines', () => {
  it('fetches and parses XML for a valid state', async () => {
    const xml = `<?xml version="1.0"?>
<DeadlineDates>
  <DeadlineDate>
    <ElectionType>General Election</ElectionType>
    <Rules>
      <Rule>
        <RuleDescription>Registration by Mail</RuleDescription>
        <DeadlineDate>10/19/2026</DeadlineDate>
      </Rule>
    </Rules>
  </DeadlineDate>
</DeadlineDates>`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(xml),
    });

    const result = await fetchFvapDeadlines('CA');
    expect(result.registration_deadline_by_mail).toBe('2026-10-19');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.fvap.gov/xml-api/California/deadline-dates.xml',
      expect.any(Object),
    );
  });

  it('throws for unknown state code', async () => {
    await expect(fetchFvapDeadlines('ZZ')).rejects.toThrow('Unknown state code: ZZ');
  });

  it('throws on non-OK HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchFvapDeadlines('CA')).rejects.toThrow('FVAP API returned 404');
  });
});
