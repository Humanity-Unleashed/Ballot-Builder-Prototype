/**
 * Database Seed Script
 *
 * Seeds ZipcodeLookup, VoterInfoCache, and BallotCache with real
 * Michigan data so the prototype works entirely from the database
 * without needing live API keys.
 *
 * Voter rules come from the curated dataset at src/server/data/stateVotingRules.ts
 * (sourced from Michigan SOS / MVIC official websites).
 *
 * Run: npm run db:seed
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '../src/generated/prisma/client';
import type { Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createHash } from 'crypto';
import { getStateVotingRules } from '../src/server/data/stateVotingRules';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ============================================
// Michigan District Info
// ============================================

const MI_OCD_DIVISION_IDS = [
  'ocd-division/country:us',
  'ocd-division/country:us/state:mi',
  'ocd-division/country:us/state:mi/county:wayne',
  'ocd-division/country:us/state:mi/place:detroit',
  'ocd-division/country:us/state:mi/cd:13',
  'ocd-division/country:us/state:mi/sldl:5',
  'ocd-division/country:us/state:mi/sldu:1',
];

function computeDistrictHash(ocdIds: string[]): string {
  const sorted = [...ocdIds].sort();
  return createHash('sha256').update(sorted.join('|')).digest('hex').slice(0, 32);
}

const DISTRICT_HASH = computeDistrictHash(MI_OCD_DIVISION_IDS);
const ELECTION_DATE = '2026-11-03';

// ============================================
// Michigan Voter Info (from curated dataset)
// ============================================

const MI_VOTER_RULES = getStateVotingRules('MI');

// ============================================
// Michigan Sample Ballot
// ============================================

const MI_BALLOT = {
  id: 'mi-wayne-detroit-2026-general',
  electionDate: ELECTION_DATE,
  electionType: 'General Election',
  state: 'MI',
  county: 'Wayne',
  items: [
    // ── Federal Races ──
    {
      id: 'mi-contest-us-senate',
      type: 'candidate',
      office: 'U.S. Senator',
      jurisdiction: 'federal',
      termInfo: '6-year term. Michigan\'s Class I Senate seat.',
      votingFor: 1,
      candidates: [
        {
          id: 'mi-cand-senate-1',
          contestId: 'mi-contest-us-senate',
          name: { full: 'Elissa Slotkin', ballotDisplay: 'Elissa Slotkin' },
          party: 'Democratic',
          incumbencyStatus: 'incumbent',
          ballotOrder: 1,
          positions: ['Protect reproductive rights', 'Bipartisan infrastructure investment', 'Lower prescription drug costs'],
          profileSummary: 'First-term senator and former intelligence officer focused on national security and bipartisan governance.',
        },
        {
          id: 'mi-cand-senate-2',
          contestId: 'mi-contest-us-senate',
          name: { full: 'Mike Rogers', ballotDisplay: 'Mike Rogers' },
          party: 'Republican',
          incumbencyStatus: 'challenger',
          ballotOrder: 2,
          positions: ['Secure the border', 'Reduce government spending', 'Support law enforcement'],
          profileSummary: 'Former U.S. Representative and FBI special agent focused on public safety and fiscal responsibility.',
        },
      ],
    },
    {
      id: 'mi-contest-us-rep-13',
      type: 'candidate',
      office: 'U.S. Representative, District 13',
      jurisdiction: 'federal',
      termInfo: '2-year term. Covers most of Detroit and parts of Wayne County.',
      votingFor: 1,
      candidates: [
        {
          id: 'mi-cand-rep13-1',
          contestId: 'mi-contest-us-rep-13',
          name: { full: 'Shri Thanedar', ballotDisplay: 'Shri Thanedar' },
          party: 'Democratic',
          incumbencyStatus: 'incumbent',
          ballotOrder: 1,
          positions: ['Medicare for All', 'Green New Deal', 'Raise minimum wage'],
          profileSummary: 'Businessman and first-term representative advocating for progressive economic policies.',
        },
        {
          id: 'mi-cand-rep13-2',
          contestId: 'mi-contest-us-rep-13',
          name: { full: 'Martell Bivings', ballotDisplay: 'Martell Bivings' },
          party: 'Republican',
          incumbencyStatus: 'challenger',
          ballotOrder: 2,
          positions: ['School choice', 'Tax cuts for small businesses', 'Community policing'],
          profileSummary: 'Small business owner focused on economic opportunity and education reform in Detroit.',
        },
      ],
    },
    // ── State Races ──
    {
      id: 'mi-contest-governor',
      type: 'candidate',
      office: 'Governor',
      jurisdiction: 'state',
      termInfo: '4-year term. Michigan\'s 50th gubernatorial election.',
      votingFor: 1,
      candidates: [
        {
          id: 'mi-cand-gov-1',
          contestId: 'mi-contest-governor',
          name: { full: 'Gretchen Whitmer', ballotDisplay: 'Gretchen Whitmer' },
          party: 'Democratic',
          incumbencyStatus: 'incumbent',
          ballotOrder: 1,
          positions: ['Fix the roads', 'Protect Great Lakes', 'Expand pre-K education'],
          profileSummary: 'Two-term governor known for infrastructure investment and environmental protection.',
        },
        {
          id: 'mi-cand-gov-2',
          contestId: 'mi-contest-governor',
          name: { full: 'James Craig', ballotDisplay: 'James Craig' },
          party: 'Republican',
          incumbencyStatus: 'challenger',
          ballotOrder: 2,
          positions: ['Tough on crime', 'Lower taxes', 'Support auto industry'],
          profileSummary: 'Former Detroit Police Chief running on a public safety and economic growth platform.',
        },
        {
          id: 'mi-cand-gov-3',
          contestId: 'mi-contest-governor',
          name: { full: 'Mary Buzuma', ballotDisplay: 'Mary Buzuma' },
          party: 'Libertarian',
          incumbencyStatus: 'challenger',
          ballotOrder: 3,
          positions: ['Reduce government regulation', 'Protect civil liberties', 'School choice'],
          profileSummary: 'Attorney and Libertarian candidate advocating for individual rights and limited government.',
        },
      ],
    },
    {
      id: 'mi-contest-state-rep-5',
      type: 'candidate',
      office: 'State Representative, District 5',
      jurisdiction: 'state',
      termInfo: '2-year term. Covers downtown Detroit and surrounding neighborhoods.',
      votingFor: 1,
      candidates: [
        {
          id: 'mi-cand-staterep5-1',
          contestId: 'mi-contest-state-rep-5',
          name: { full: 'Natalie Price', ballotDisplay: 'Natalie Price' },
          party: 'Democratic',
          incumbencyStatus: 'incumbent',
          ballotOrder: 1,
          positions: ['Affordable housing', 'Public transit expansion', 'Environmental justice'],
          profileSummary: 'Community organizer turned legislator focused on housing affordability in Detroit.',
        },
        {
          id: 'mi-cand-staterep5-2',
          contestId: 'mi-contest-state-rep-5',
          name: { full: 'Robert Williams', ballotDisplay: 'Robert Williams' },
          party: 'Republican',
          incumbencyStatus: 'challenger',
          ballotOrder: 2,
          positions: ['Tax relief for homeowners', 'Support small businesses', 'School safety'],
          profileSummary: 'Local business owner and veteran running on economic revitalization for Detroit neighborhoods.',
        },
      ],
    },
    // ── State Ballot Proposals ──
    {
      id: 'mi-measure-prop-1',
      type: 'measure',
      title: 'Proposal 1: Michigan Infrastructure Bond',
      shortTitle: 'Prop 1: Infrastructure',
      description: 'Would authorize $3 billion in bonds to repair and replace roads, bridges, water infrastructure, and broadband in underserved communities across Michigan.',
      outcomes: {
        yes: 'Authorizes $3 billion in general obligation bonds for statewide infrastructure projects.',
        no: 'No bonds issued. Infrastructure funding continues through existing appropriations.',
      },
      explanation: 'Michigan faces an estimated $4 billion infrastructure deficit. This bond would fund road repairs, bridge replacements, water system upgrades, and broadband expansion, with priority given to communities with the greatest need.',
      supporters: ['Michigan Chamber of Commerce', 'AFL-CIO Michigan', 'Michigan Municipal League'],
      opponents: ['Michigan Freedom Fund', 'Mackinac Center for Public Policy'],
    },
    {
      id: 'mi-measure-prop-2',
      type: 'measure',
      title: 'Proposal 2: Ranked Choice Voting for State Elections',
      shortTitle: 'Prop 2: Ranked Choice',
      description: 'Would establish ranked-choice voting for all state-level primary and general elections in Michigan, allowing voters to rank candidates in order of preference.',
      outcomes: {
        yes: 'Michigan adopts ranked-choice voting for state primaries and general elections starting 2028.',
        no: 'Michigan retains current first-past-the-post voting system.',
      },
      explanation: 'Ranked-choice voting allows voters to rank candidates. If no candidate wins a majority, the last-place candidate is eliminated and their votes are redistributed until someone reaches 50%+1.',
      supporters: ['Voters Not Politicians Michigan', 'League of Women Voters MI', 'FairVote Michigan'],
      opponents: ['Michigan Republican Party', 'Heritage Foundation Michigan'],
    },
    // ── Local Measures ──
    {
      id: 'mi-measure-detroit-transit',
      type: 'measure',
      title: 'Detroit Regional Transit Millage Renewal',
      shortTitle: 'Transit Millage',
      description: 'Renews the existing 1.5-mill property tax levy for 10 years to fund Detroit Department of Transportation (DDOT) bus service and regional transit connections.',
      outcomes: {
        yes: 'Renews transit millage for 10 years, maintaining current bus service levels and funding route expansions.',
        no: 'Millage expires. DDOT faces 30% service reduction without replacement funding.',
      },
      explanation: 'The current transit millage expires in 2027. This renewal would maintain DDOT bus service that serves over 100,000 daily riders and fund new crosstown routes connecting to suburban job centers.',
      supporters: ['Transportation Riders United', 'Detroit Regional Chamber', 'Mayor\'s Office'],
      opponents: ['Detroit Taxpayers Alliance'],
    },
  ],
};

// ============================================
// Seed zipcodes (Detroit area)
// ============================================

const SEED_ZIPCODES = [
  { zipcode: '48226', lat: 42.3314, lng: -83.0458, city: 'detroit' },  // Downtown Detroit
  { zipcode: '48216', lat: 42.3378, lng: -83.0710, city: 'detroit' },  // Southwest Detroit
];

// ============================================
// Main seed function
// ============================================

async function main() {
  console.log('Seeding Michigan example data...\n');

  // 1. Seed VoterInfoCache
  const voterInfo = await prisma.voterInfoCache.upsert({
    where: { stateCode: 'MI' },
    update: {
      rules: JSON.parse(JSON.stringify(MI_VOTER_RULES)) as Prisma.InputJsonValue,
      fetchedAt: new Date(),
    },
    create: {
      stateCode: 'MI',
      rules: JSON.parse(JSON.stringify(MI_VOTER_RULES)) as Prisma.InputJsonValue,
    },
  });
  console.log(`  ✓ VoterInfoCache: MI (${voterInfo.id})`);

  // 2. Seed BallotCache
  const ballotCache = await prisma.ballotCache.upsert({
    where: {
      districtHash_electionDate: {
        districtHash: DISTRICT_HASH,
        electionDate: ELECTION_DATE,
      },
    },
    update: {
      rawBallot: JSON.parse(JSON.stringify(MI_BALLOT)) as Prisma.InputJsonValue,
      fetchedAt: new Date(),
    },
    create: {
      districtHash: DISTRICT_HASH,
      electionDate: ELECTION_DATE,
      rawBallot: JSON.parse(JSON.stringify(MI_BALLOT)) as Prisma.InputJsonValue,
    },
  });
  console.log(`  ✓ BallotCache: ${DISTRICT_HASH.slice(0, 12)}… / ${ELECTION_DATE} (${ballotCache.id})`);

  // 3. Seed ZipcodeLookup for Detroit zipcodes
  for (const zip of SEED_ZIPCODES) {
    const lookup = await prisma.zipcodeLookup.upsert({
      where: { zipcode: zip.zipcode },
      update: {
        state: 'MI',
        county: 'wayne',
        city: zip.city,
        ocdDivisionIds: MI_OCD_DIVISION_IDS,
        lat: zip.lat,
        lng: zip.lng,
        districtHash: DISTRICT_HASH,
        fetchedAt: new Date(),
      },
      create: {
        zipcode: zip.zipcode,
        state: 'MI',
        county: 'wayne',
        city: zip.city,
        ocdDivisionIds: MI_OCD_DIVISION_IDS,
        lat: zip.lat,
        lng: zip.lng,
        districtHash: DISTRICT_HASH,
      },
    });
    console.log(`  ✓ ZipcodeLookup: ${zip.zipcode} (${lookup.id})`);
  }

  console.log('\nSeed complete!');
  console.log(`\nTest with:`);
  console.log(`  curl "http://localhost:3000/api/ballot/by-zipcode?zipcode=48226"`);
  console.log(`  curl "http://localhost:3000/api/ballot/by-zipcode?zipcode=48216"`);
  console.log(`\nBoth return source: "cache" with full Michigan ballot data — no API keys needed.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
