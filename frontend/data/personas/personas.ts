/**
 * Persona data for Ballot Builder
 * Source: ballot-builder-prototype
 *
 * These represent diverse voter profiles that users can select from
 * instead of filling out a lengthy intake questionnaire.
 */

import type { Persona } from "../../types/persona";

export const personas: Persona[] = [
  {
    id: "persona_ashley_fulton",
    name: "Ashley Thompson",
    county: "Fulton",
    city: "Atlanta",
    age: 27,
    incomeLevel: "low",
    gender: "female",
    story: "Ashley recently moved to Atlanta for work and rents an apartment near downtown. She is early in her career, concerned about rising housing costs, healthcare access, and whether local government decisions will make it harder or easier for her to stay in the city long term."
  },
  {
    id: "persona_marcus_dekalb",
    name: "Marcus Reynolds",
    county: "Dekalb",
    city: "Decatur",
    age: 41,
    incomeLevel: "medium",
    gender: "male",
    story: "Marcus is a homeowner and parent of two school-aged children. He pays close attention to education policy, property taxes, and public safety, but finds it difficult to understand how down-ballot races affect his family day to day."
  },
  {
    id: "persona_linda_cobb",
    name: "Linda Watkins",
    county: "Cobb",
    city: "Marietta",
    age: 68,
    incomeLevel: "medium",
    gender: "female",
    story: "Linda is retired and lives on a fixed income. She follows the news closely but feels overwhelmed by ballots that include many unfamiliar offices. She is especially concerned about utility rates, property taxes, and access to healthcare."
  },
  {
    id: "persona_daniel_gwinnett",
    name: "Daniel Park",
    county: "Gwinnett",
    city: "Duluth",
    age: 35,
    incomeLevel: "high",
    gender: "male",
    story: "Daniel works long hours in a professional role and follows politics only at a high level. He wants to vote responsibly but prefers concise explanations and clear recommendations rather than doing extensive research himself."
  },
  {
    id: "persona_robin_clayton",
    name: "Robin Ellis",
    county: "Clayton",
    city: "Jonesboro",
    age: 52,
    incomeLevel: "low",
    gender: "nonbinary",
    story: "Robin is active in local community organizations and cares deeply about equity, public services, and local governance. They often feel that important local races and referenda receive little explanation despite having major impacts on residents."
  },
  {
    id: "persona_jordan_gwinnett",
    name: "Jordan Alvarez",
    county: "Gwinnett",
    city: "Norcross",
    age: 31,
    incomeLevel: "low",
    gender: "nonbinary",
    story: "Jordan works in the service industry and has moved several times in the past few years due to rising rent and unstable housing options. They care about healthcare access, tenant protections, and whether local decisions will improve economic stability for people without a financial safety net."
  }
];

/**
 * Get a persona by ID
 */
export function getPersonaById(id: string): Persona | undefined {
  return personas.find(p => p.id === id);
}

/**
 * Get personas by county
 */
export function getPersonasByCounty(county: string): Persona[] {
  return personas.filter(p => p.county.toLowerCase() === county.toLowerCase());
}
