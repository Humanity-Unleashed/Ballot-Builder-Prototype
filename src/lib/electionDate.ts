/**
 * Election date utilities.
 * US general elections fall on the first Tuesday after the first Monday in November.
 */

/** Returns the next US general election day on or after `from`. */
export function getNextElectionDay(from: Date = new Date()): Date {
  let year = from.getFullYear();

  const candidate = electionDayForYear(year);
  if (candidate >= stripTime(from)) return candidate;

  // Election already passed this year — next even year (federal) or just next year?
  // General elections happen every year (state/local), so just bump by 1.
  return electionDayForYear(year + 1);
}

/** First Tuesday after the first Monday in November for a given year. */
function electionDayForYear(year: number): Date {
  // First day of November
  const nov1 = new Date(year, 10, 1); // month is 0-indexed
  // Day of week: 0=Sun … 6=Sat
  const dow = nov1.getDay();
  // First Monday: if Nov 1 is Monday (1) offset=0, Tue(2)=6, Wed(3)=5, …
  const firstMonday = dow <= 1 ? 1 + (1 - dow) : 1 + (8 - dow);
  // First Tuesday after first Monday = firstMonday + 1
  return new Date(year, 10, firstMonday + 1);
}

/** Whole days between `from` and `target` (positive if target is in the future). */
export function daysUntil(target: Date, from: Date = new Date()): number {
  const ms = stripTime(target).getTime() - stripTime(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Format a date as e.g. "November 3, 2026". */
export function formatElectionDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Strip time components, returning midnight local. */
function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
