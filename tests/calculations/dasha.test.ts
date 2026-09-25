/// <reference lib="deno.ns" />
import {
  VIMSHOTTARI_SEQUENCE,
  antardasaDurationYears,
  calculateVimshottariBirthState,
  nakshatraNumber,
  nextVimshottariLord,
  padaNumber,
  vimshottariLordForNakshatra,
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
  const bad = [
    () => nakshatraNumber(Number.NaN),
    () => padaNumber(Number.POSITIVE_INFINITY),
    () => vimshottariLordForNakshatra(28),
    () => nextVimshottariLord(99),
    () => antardasaDurationYears(-1, 9),
    () => calculateVimshottariBirthState(0, 0),
  ];
  for (const f of bad) {
    let rejected = false;
    try { f(); } catch { rejected = true; }
    if (!rejected) throw Error("invalid input accepted");
  }
});
