/// <reference lib="deno.ns" />
import {
  VIMSHOTTARI_SEQUENCE,
  antardasaDurationYears,
  durationYearsForGraha,
  calculateVimshottariBirthState,
  nakshatraNumber,
  normalizeLongitude,
  nextVimshottariLord,
  padaNumber,
  vimshottariLordForNakshatra,
  vimshottariSubperiodDurationDays,
  vimshottariSubperiodDurationYears,
} from "../../supabase/functions/jyotisha-calculator/core/dasha.ts";

Deno.test("Vimshottari sequence is the classical 120-year cycle", () => {
  const years = VIMSHOTTARI_SEQUENCE.reduce((s, x) => s + x.duration_years, 0);
  if (years !== 120) throw Error("Vimshottari sequence total mismatch");
  const lords = VIMSHOTTARI_SEQUENCE.map((x) => x.graha_id);
  const expected = [9, 7, 1, 2, 3, 8, 5, 6, 4];
  if (JSON.stringify(lords) !== JSON.stringify(expected)) throw Error("lord sequence mismatch");
});

Deno.test("Golden Moon resolves to Mula Pada 4 and Ketu balance", () => {
  const s = calculateVimshottariBirthState(252.348067345032);
  if (s.nakshatra_number !== 19 || s.pada_number !== 4 || s.nakshatra_lord_graha_id !== 9) {
    throw Error("Golden Moon nakshatra state mismatch");
  }
  if (Math.abs(s.starting_mahadasa_years - 0.517264643858051) > 1e-12) {
    throw Error("Golden Moon balance mismatch");
  }
});

Deno.test("Vimshottari boundary normalization is deterministic", () => {
  const cases = [
    [0, 1, 1, 9],
    [13.3333333333333, 2, 1, 7],
    [240, 19, 1, 9],
    [359.999999999, 27, 4, 4],
    [360, 1, 1, 9],
    [-0.000001, 27, 4, 4],
  ] as const;
  for (const [lon, nak, pada, lord] of cases) {
    if (nakshatraNumber(lon) !== nak || padaNumber(lon) !== pada || vimshottariLordForNakshatra(nak) !== lord) {
      throw Error("boundary mismatch");
    }
  }
});

Deno.test("Vimshottari lord rotation and antardasa duration", () => {
  if (nextVimshottariLord(9) !== 7 || nextVimshottariLord(4) !== 9) throw Error("lord rotation mismatch");
  const ad = antardasaDurationYears(7, 9);
  if (Math.abs(ad - 0.4083333333333333) > 1e-12) throw Error("antardasa duration mismatch");
});

Deno.test("Vimshottari rejects invalid inputs", () => {
  if (normalizeLongitude(-0.5) !== 359.5 || normalizeLongitude(360) !== 0) throw Error("longitude normalization mismatch");
  if (Math.abs(calculateVimshottariBirthState(13.3333333333333, 365).fraction_completed) > 1e-12) throw Error("boundary birth-state mismatch");
  if (durationYearsForGraha(9) !== 7) throw Error("duration lookup mismatch");
  const bad = [
    () => nakshatraNumber(Number.NaN),
    () => padaNumber(Number.POSITIVE_INFINITY),
    () => vimshottariLordForNakshatra(28),
    () => nextVimshottariLord(99),
    () => antardasaDurationYears(-1, 9),
    () => calculateVimshottariBirthState(0, 0),
    () => durationYearsForGraha(99),
    () => antardasaDurationYears(Number.NaN, 9),
  ];
  for (const f of bad) {
    let rejected = false;
    try { f(); } catch { rejected = true; }
    if (!rejected) throw Error("invalid input accepted");
  }
});


Deno.test("Vimshottari deep subperiods preserve the same 120-year proportion", () => {
  const mahadasa = 20;
  const antardasa = vimshottariSubperiodDurationYears(mahadasa, 7);
  const pratyantardasa = vimshottariSubperiodDurationYears(antardasa, 1);
  const sukshma = vimshottariSubperiodDurationYears(pratyantardasa, 2);
  const prana = vimshottariSubperiodDurationYears(sukshma, 3);

  if (Math.abs(antardasa - (20 * 20 / 120)) > 1e-12) throw Error("AD mismatch");
  if (Math.abs(pratyantardasa - (antardasa * 6 / 120)) > 1e-12) throw Error("PD mismatch");
  if (Math.abs(sukshma - (pratyantardasa * 10 / 120)) > 1e-12) throw Error("Sukshma mismatch");
  if (Math.abs(prana - (sukshma * 7 / 120)) > 1e-12) throw Error("Prana mismatch");
});

Deno.test("Vimshottari day-based recursion preserves parent duration", () => {
  const parentDays = 365.25 * 7;
  const children = VIMSHOTTARI_SEQUENCE.reduce(
    (sum, child) => sum + vimshottariSubperiodDurationDays(parentDays, child.graha_id),
    0,
  );
  if (Math.abs(children - parentDays) > 1e-9) throw Error("child periods do not preserve parent duration");
});

Deno.test("Vimshottari deep subperiod helpers reject invalid parent durations", () => {
  const bad = [
    () => vimshottariSubperiodDurationYears(-1, 9),
    () => vimshottariSubperiodDurationYears(Number.NaN, 9),
    () => vimshottariSubperiodDurationDays(-1, 9),
    () => vimshottariSubperiodDurationDays(Number.POSITIVE_INFINITY, 9),
    () => vimshottariSubperiodDurationDays(1, 99),
  ];
  for (const f of bad) {
    let rejected = false;
    try { f(); } catch { rejected = true; }
    if (!rejected) throw Error("invalid deep subperiod input accepted");
  }
});
