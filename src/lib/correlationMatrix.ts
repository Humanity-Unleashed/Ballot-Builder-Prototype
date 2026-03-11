/**
 * Cross-axis correlation matrix for 16 civic policy axes.
 *
 * Constructed from ANES cumulative data, Pew Political Typology,
 * and known structural relationships between policy domains.
 *
 * Reference: research/02_adaptive_sequencing.md Section 4
 */

/** All 16 axis IDs in canonical order (matches matrix row/column indices). */
export const AXIS_IDS = [
  'econ_safetynet',               // 0
  'econ_investment',              // 1
  'econ_school_choice',           // 2
  'econ_tax_structure',           // 3
  'health_coverage_model',        // 4
  'health_cost_control',          // 5
  'health_public_health',         // 6
  'housing_supply_zoning',        // 7
  'housing_affordability_tools',  // 8
  'housing_transport_priority',   // 9
  'justice_policing_accountability', // 10
  'justice_sentencing_goals',     // 11
  'justice_firearms',             // 12
  'climate_ambition',             // 13
  'climate_energy_portfolio',     // 14
  'climate_permitting',           // 15
] as const;

export type AxisId = (typeof AXIS_IDS)[number];

/** Number of axes */
export const N_AXES = AXIS_IDS.length;

/**
 * 16x16 Pearson correlation matrix.
 * Symmetric, diagonal = 1.00.
 *
 * Row/column order matches AXIS_IDS.
 * Values are heuristic estimates to be refined with empirical data.
 */
// prettier-ignore
export const CORRELATION_MATRIX: readonly (readonly number[])[] = [
  //         SN    IN    SC    TS    CV    CC    PH    ZN    AF    TR    PO    SE    FI    CA    EN    PM
  /* SN */ [ 1.00, 0.65, 0.40, 0.55, 0.55, 0.45, 0.40, 0.10, 0.45, 0.20, 0.40, 0.35, 0.35, 0.30, 0.25, 0.05 ],
  /* IN */ [ 0.65, 1.00, 0.35, 0.60, 0.45, 0.40, 0.30, 0.15, 0.35, 0.25, 0.30, 0.25, 0.25, 0.35, 0.30, 0.05 ],
  /* SC */ [ 0.40, 0.35, 1.00, 0.30, 0.25, 0.20, 0.15, 0.00, 0.20, 0.05, 0.15, 0.10, 0.20, 0.10, 0.05, 0.00 ],
  /* TS */ [ 0.55, 0.60, 0.30, 1.00, 0.40, 0.35, 0.25, 0.10, 0.30, 0.15, 0.25, 0.20, 0.20, 0.30, 0.25, 0.05 ],
  /* CV */ [ 0.55, 0.45, 0.25, 0.40, 1.00, 0.60, 0.50, 0.10, 0.40, 0.20, 0.40, 0.35, 0.30, 0.35, 0.30, 0.10 ],
  /* CC */ [ 0.45, 0.40, 0.20, 0.35, 0.60, 1.00, 0.45, 0.05, 0.35, 0.15, 0.30, 0.25, 0.20, 0.25, 0.20, 0.05 ],
  /* PH */ [ 0.40, 0.30, 0.15, 0.25, 0.50, 0.45, 1.00, 0.10, 0.30, 0.20, 0.50, 0.55, 0.35, 0.30, 0.25, 0.10 ],
  /* ZN */ [ 0.10, 0.15, 0.00, 0.10, 0.10, 0.05, 0.10, 1.00, 0.25, 0.55, 0.05, 0.00, 0.00, 0.15, 0.10,-0.25 ],
  /* AF */ [ 0.45, 0.35, 0.20, 0.30, 0.40, 0.35, 0.30, 0.25, 1.00, 0.30, 0.30, 0.25, 0.20, 0.25, 0.20, 0.05 ],
  /* TR */ [ 0.20, 0.25, 0.05, 0.15, 0.20, 0.15, 0.20, 0.55, 0.30, 1.00, 0.15, 0.10, 0.05, 0.40, 0.35,-0.10 ],
  /* PO */ [ 0.40, 0.30, 0.15, 0.25, 0.40, 0.30, 0.50, 0.05, 0.30, 0.15, 1.00, 0.65, 0.50, 0.35, 0.30, 0.10 ],
  /* SE */ [ 0.35, 0.25, 0.10, 0.20, 0.35, 0.25, 0.55, 0.00, 0.25, 0.10, 0.65, 1.00, 0.45, 0.25, 0.20, 0.10 ],
  /* FI */ [ 0.35, 0.25, 0.20, 0.20, 0.30, 0.20, 0.35, 0.00, 0.20, 0.05, 0.50, 0.45, 1.00, 0.30, 0.25, 0.05 ],
  /* CA */ [ 0.30, 0.35, 0.10, 0.30, 0.35, 0.25, 0.30, 0.15, 0.25, 0.40, 0.35, 0.25, 0.30, 1.00, 0.70, 0.30 ],
  /* EN */ [ 0.25, 0.30, 0.05, 0.25, 0.30, 0.20, 0.25, 0.10, 0.20, 0.35, 0.30, 0.20, 0.25, 0.70, 1.00, 0.35 ],
  /* PM */ [ 0.05, 0.05, 0.00, 0.05, 0.10, 0.05, 0.10,-0.25, 0.05,-0.10, 0.10, 0.10, 0.05, 0.30, 0.35, 1.00 ],
];

/**
 * Get the correlation between two axes by their IDs.
 * Returns 0 if either axis is not found.
 */
export function getCorrelation(axisA: string, axisB: string): number {
  const i = AXIS_IDS.indexOf(axisA as AxisId);
  const j = AXIS_IDS.indexOf(axisB as AxisId);
  if (i === -1 || j === -1) return 0;
  return CORRELATION_MATRIX[i][j];
}

/**
 * Get all axes correlated with the given axis above a threshold.
 * Returns array of { axisId, rho } sorted by |rho| descending.
 */
export function getCorrelatedAxes(
  axisId: string,
  threshold = 0.15,
): { axisId: string; rho: number }[] {
  const idx = AXIS_IDS.indexOf(axisId as AxisId);
  if (idx === -1) return [];

  const results: { axisId: string; rho: number }[] = [];
  for (let i = 0; i < N_AXES; i++) {
    if (i === idx) continue;
    const rho = CORRELATION_MATRIX[idx][i];
    if (Math.abs(rho) >= threshold) {
      results.push({ axisId: AXIS_IDS[i], rho });
    }
  }
  return results.sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho));
}

/**
 * Get the domain for an axis ID.
 */
export function getDomainForAxis(axisId: string): string {
  if (axisId.startsWith('econ_')) return 'econ';
  if (axisId.startsWith('health_')) return 'health';
  if (axisId.startsWith('housing_')) return 'housing';
  if (axisId.startsWith('justice_')) return 'justice';
  if (axisId.startsWith('climate_')) return 'climate';
  return 'unknown';
}
