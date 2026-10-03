/** V2 is deliberately separate from the legacy V1 catalog and persisted periods. */
export const DEEP_DASHA_VERSION = "VIMSHOTTARI_365.250_V2" as const;
const YEAR_MS = 365.25 * 86400000;
// IDs match grahas, natal positions and prediction consumers (Venus=6, Saturn=7).
const LORDS = [9, 6, 1, 2, 3, 8, 5, 7, 4] as const;
const YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17] as const;

export type DeepDashaInput = {
  /** Canonical UTC ISO timestamp, including milliseconds; resolve historical timezone upstream. */
  birth_at: string;
  /** Sidereal degrees within one signed revolution [-360,360]. */
  moon_longitude_sidereal: number;
  md_count?: number;
  /** 1=MD, 2=AD, 3=PD, 4=Sukshma, 5=Prana. */
  depth?: number;
};
export type DeepDashaPeriod = {
  path: string;
  parent_path: string | null;
  level: number;
  sequence_order: number;
  graha_id: number;
  start_at: string;
  end_at: string;
  duration_ms: number;
  calculation_version: typeof DEEP_DASHA_VERSION;
};

/**
 * Fixed 365.25-day years; half-open [start,end) intervals at millisecond precision.
 * Split full, un-clipped parents, then clip at birth. Shared cumulative boundaries
 * prevent drift and keep all descendants inside their parents. No wall clock or IO.
 */
export function generateDeepVimshottari(
  input: DeepDashaInput,
): DeepDashaPeriod[] {
  const birth = Date.parse(input.birth_at);
  const count = input.md_count ?? 9;
  const depth = input.depth ?? 3;
  if (
    !Number.isFinite(birth) ||
    new Date(birth).toISOString() !== input.birth_at ||
    !/^\d{4}-/.test(input.birth_at) || new Date(birth).getUTCFullYear() < 1
  ) throw Error("birth_at must be canonical UTC ISO");
  if (
    !Number.isFinite(input.moon_longitude_sidereal) ||
    Math.abs(input.moon_longitude_sidereal) > 360
  ) {
    throw Error("Moon longitude must be finite and within -360..360");
  }
  if (!Number.isInteger(count) || count < 1 || count > 18) {
    throw Error("md_count must be 1..18");
  }
  if (!Number.isInteger(depth) || depth < 1 || depth > 5) {
    throw Error("depth must be 1..5");
  }
  const remainder = input.moon_longitude_sidereal % 360;
  const longitude = remainder < 0 ? remainder + 360 : remainder;
  const span = 360 / 27;
  const nakIndex = Math.min(26, Math.floor(longitude / span));
  const first = nakIndex % 9;
  const fraction = (longitude - nakIndex * span) / span;
  let start = Math.round(birth - fraction * YEARS[first] * YEAR_MS);
  const rows: DeepDashaPeriod[] = [];

  function visit(
    fullStart: number,
    fullEnd: number,
    lord: number,
    level: number,
    order: number,
    parent: string | null,
  ) {
    const clippedStart = Math.max(fullStart, birth);
    if (fullEnd <= clippedStart) return;
    const path = parent === null ? String(order) : `${parent}.${order}`;
    rows.push({
      path,
      parent_path: parent,
      level,
      sequence_order: order,
      graha_id: LORDS[lord],
      start_at: new Date(clippedStart).toISOString(),
      end_at: new Date(fullEnd).toISOString(),
      duration_ms: fullEnd - clippedStart,
      calculation_version: DEEP_DASHA_VERSION,
    });
    if (level === depth) return;
    let weight = 0;
    let childStart = fullStart;
    for (let i = 0; i < 9; i++) {
      const childLord = (lord + i) % 9;
      weight += YEARS[childLord];
      const childEnd = Math.round(
        fullStart + (fullEnd - fullStart) * weight / 120,
      );
      visit(childStart, childEnd, childLord, level + 1, i + 1, path);
      childStart = childEnd;
    }
  }
  for (let i = 0; i < count; i++) {
    const lord = (first + i) % 9;
    const end = start + YEARS[lord] * YEAR_MS;
    visit(start, end, lord, 1, i + 1, null);
    start = end;
  }
  return rows;
}
