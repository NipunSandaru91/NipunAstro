export const VIMSHOTTARI_YEAR_DAYS = 365.25;
export const VIMSHOTTARI_ENGINE_VERSION = "VIMSHOTTARI_365.250_V1" as const;
const BOUNDARY_EPSILON = 1e-12;

export type VimshottariBirthState = {
  moon_longitude_sidereal: number;
  nakshatra_number: number;
  pada_number: number;
  nakshatra_lord_graha_id: number;
  fraction_completed: number;
  fraction_remaining: number;
  starting_mahadasa_years: number;
  starting_mahadasa_days: number;
};

export type VimshottariSequenceEntry = {
  sequence_order: number;
  graha_id: number;
  duration_years: number;
};

export const VIMSHOTTARI_SEQUENCE: VimshottariSequenceEntry[] = [
  { sequence_order: 1, graha_id: 9, duration_years: 7 },
  { sequence_order: 2, graha_id: 7, duration_years: 20 },
  { sequence_order: 3, graha_id: 1, duration_years: 6 },
  { sequence_order: 4, graha_id: 2, duration_years: 10 },
  { sequence_order: 5, graha_id: 3, duration_years: 7 },
  { sequence_order: 6, graha_id: 8, duration_years: 18 },
  { sequence_order: 7, graha_id: 5, duration_years: 16 },
  { sequence_order: 8, graha_id: 6, duration_years: 19 },
  { sequence_order: 9, graha_id: 4, duration_years: 17 },
];

function assertFiniteLongitude(v: number) {
  if (!Number.isFinite(v)) throw new Error("moon_longitude_sidereal must be finite");
}

export function normalizeLongitude(longitude: number): number {
  assertFiniteLongitude(longitude);
  const n = longitude % 360;
  return n < 0 ? n + 360 : n;
}

export function nakshatraNumber(longitude: number): number {
  const lon = normalizeLongitude(longitude);
  return Math.floor((lon + BOUNDARY_EPSILON) / (360 / 27)) + 1;
}

export function padaNumber(longitude: number): number {
  const lon = normalizeLongitude(longitude);
  const span = 360 / 27;
  const nakIndex = Math.floor((lon + BOUNDARY_EPSILON) / span);
  const within = Math.max(0, lon - nakIndex * span);
  return Math.min(4, Math.floor((within + BOUNDARY_EPSILON) / (360 / 108)) + 1);
}

export function vimshottariLordForNakshatra(nakshatra: number): number {
  if (!Number.isInteger(nakshatra) || nakshatra < 1 || nakshatra > 27) {
    throw new Error("nakshatra number must be an integer from 1 to 27");
  }
  return VIMSHOTTARI_SEQUENCE[(nakshatra - 1) % 9].graha_id;
}

export function durationYearsForGraha(grahaId: number): number {
  const entry = VIMSHOTTARI_SEQUENCE.find((x) => x.graha_id === grahaId);
  if (!entry) throw new Error("graha_id is not a Vimshottari lord");
  return entry.duration_years;
}

export function calculateVimshottariBirthState(
  moonLongitudeSidereal: number,
  yearDays = VIMSHOTTARI_YEAR_DAYS,
): VimshottariBirthState {
  if (!Number.isFinite(yearDays) || yearDays <= 0) {
    throw new Error("yearDays must be positive and finite");
  }
  const lon = normalizeLongitude(moonLongitudeSidereal);
  const span = 360 / 27;
  const nak = Math.floor(lon / span) + 1;
  const within = lon - (nak - 1) * span;
  const completed = within / span;
  const remaining = 1 - completed;
  const lord = vimshottariLordForNakshatra(nak);
  const startingYears = durationYearsForGraha(lord) * remaining;
  return {
    moon_longitude_sidereal: lon,
    nakshatra_number: nak,
    pada_number: padaNumber(lon),
    nakshatra_lord_graha_id: lord,
    fraction_completed: completed,
    fraction_remaining: remaining,
    starting_mahadasa_years: startingYears,
    starting_mahadasa_days: startingYears * yearDays,
  };
}

export function nextVimshottariLord(grahaId: number): number {
  const i = VIMSHOTTARI_SEQUENCE.findIndex((x) => x.graha_id === grahaId);
  if (i < 0) throw new Error("graha_id is not a Vimshottari lord");
  return VIMSHOTTARI_SEQUENCE[(i + 1) % VIMSHOTTARI_SEQUENCE.length].graha_id;
}

export function antardasaDurationYears(
  mahadasaYears: number,
  antardasaGrahaId: number,
): number {
  if (!Number.isFinite(mahadasaYears) || mahadasaYears < 0) {
    throw new Error("mahadasaYears must be non-negative and finite");
  }
  return mahadasaYears * durationYearsForGraha(antardasaGrahaId) / 120;
}
