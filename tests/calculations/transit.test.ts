/// <reference lib="deno.ns" />
import {
  buildTransitPosition,
  ketuFromRahu,
  normalizeNodeMethod,
  transitRasi,
} from "../../supabase/functions/jyotisha-calculator/core/transit.ts";

Deno.test("Transit Rasi mapping is deterministic", () => {
  const cases = [
    [0, 1, 0],
    [29.999, 1, 29.999],
    [30, 2, 0],
    [152.34295995925606, 6, 2.3429599592560635],
    [359.999, 12, 29.999],
    [360, 1, 0],
    [-0.001, 12, 29.999],
  ] as const;
  for (const [longitude, rasiId, degree] of cases) {
    const r = transitRasi(longitude);
    if (r.rasi_id !== rasiId || Math.abs(r.degree_in_rasi - degree) > 1e-12) {
      throw Error("Transit Rasi mapping mismatch");
    }
  }
});

Deno.test("Transit Golden runtime sample maps all required fields", () => {
  const sample = buildTransitPosition(7, 348.22606567683306, -0.01);
  if (
    sample.rasi_id !== 12 ||
    Math.abs(sample.degree_in_rasi - 18.22606567683306) > 1e-12 ||
    !sample.retrograde
  ) {
    throw Error("Transit sample mismatch");
  }
});

Deno.test("Rahu and Ketu are always 180 degrees apart with opposite speed", () => {
  const rahu = buildTransitPosition(8, 304.0915026623362, -0.052);
  const ketu = ketuFromRahu(rahu.longitude, rahu.longitude_speed);
  if (
    Math.abs(ketu.longitude - 124.09150266233621) > 1e-12 ||
    Math.abs(ketu.longitude_speed - 0.052) > 1e-12 ||
    ketu.retrograde
  ) {
    throw Error("Rahu/Ketu relationship mismatch");
  }
});

Deno.test("Node method normalization accepts only MEAN and TRUE", () => {
  if (normalizeNodeMethod(undefined) !== "MEAN") throw Error("default node method mismatch");
  if (normalizeNodeMethod("mean") !== "MEAN") throw Error("MEAN normalization mismatch");
  if (normalizeNodeMethod(" TRUE ") !== "TRUE") throw Error("TRUE normalization mismatch");
  let rejected = false;
  try { normalizeNodeMethod("APPARENT"); } catch { rejected = true; }
  if (!rejected) throw Error("invalid node method accepted");
});

Deno.test("Transit core rejects invalid values", () => {
  const bad = [
    () => transitRasi(Number.NaN),
    () => buildTransitPosition(0, 1, 1),
    () => buildTransitPosition(10, 1, 1),
    () => buildTransitPosition(1, 1, Number.NaN),
  ];
  for (const f of bad) {
    let rejected = false;
    try { f(); } catch { rejected = true; }
    if (!rejected) throw Error("invalid transit input accepted");
  }
});
