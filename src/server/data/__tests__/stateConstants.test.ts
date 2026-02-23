import { describe, it, expect } from 'vitest';
import {
  STATE_CODE_TO_NAME,
  STATE_NAME_TO_CODE,
  getGenericVotingUrls,
} from '../stateConstants';

describe('stateConstants', () => {
  it('contains all 50 states + DC (51 entries)', () => {
    expect(Object.keys(STATE_CODE_TO_NAME)).toHaveLength(51);
  });

  it('maps well-known codes correctly', () => {
    expect(STATE_CODE_TO_NAME['CA']).toBe('California');
    expect(STATE_CODE_TO_NAME['NY']).toBe('New York');
    expect(STATE_CODE_TO_NAME['TX']).toBe('Texas');
    expect(STATE_CODE_TO_NAME['DC']).toBe('District of Columbia');
    expect(STATE_CODE_TO_NAME['MI']).toBe('Michigan');
  });

  it('inverse mapping is consistent', () => {
    expect(Object.keys(STATE_NAME_TO_CODE)).toHaveLength(51);
    for (const [code, name] of Object.entries(STATE_CODE_TO_NAME)) {
      expect(STATE_NAME_TO_CODE[name]).toBe(code);
    }
  });

  it('all codes are 2 uppercase letters', () => {
    for (const code of Object.keys(STATE_CODE_TO_NAME)) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('getGenericVotingUrls', () => {
  it('returns vote.gov URLs with state slug', () => {
    const urls = getGenericVotingUrls('CA');
    expect(urls.voter_registration_url).toBe('https://vote.gov/register/california');
    expect(urls.absentee_ballot_url).toBe('https://www.nass.org/can-i-vote/absentee-early-voting');
    expect(urls.election_information_url).toBe('https://vote.gov/');
    expect(urls.polling_place_url).toBe('https://www.nass.org/can-i-vote/find-your-polling-place');
  });

  it('handles multi-word state names', () => {
    const urls = getGenericVotingUrls('NY');
    expect(urls.voter_registration_url).toBe('https://vote.gov/register/new-york');
  });

  it('handles DC', () => {
    const urls = getGenericVotingUrls('DC');
    expect(urls.voter_registration_url).toBe('https://vote.gov/register/district-of-columbia');
  });

  it('is case-insensitive', () => {
    const urls = getGenericVotingUrls('ca');
    expect(urls.voter_registration_url).toBe('https://vote.gov/register/california');
  });
});
