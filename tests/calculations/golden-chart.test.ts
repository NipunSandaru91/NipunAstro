/// <reference lib="deno.ns" />

import {
  asc1,
  cosd,
  mcFromArmc,
  norm,
  rasi,
  sind,
} from "../../supabase/functions/jyotisha-calculator/core/math.ts";
import { mapGraha, mapNodes, NATAL_BODIES } from "../../supabase/functions/jyotisha-calculator/core/planets.ts";

const SE = {
  GREG_CAL: 1,
  ECL_NUT: -1,
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  MEAN_NODE: 10,
  MOSEPH: 4,
  SIDEREAL: 65536,
  SPEED: 256,
  SIDM_LAHIRI: 1,
} as const;

const GOLDEN = {
  lagna: 110.3729229563,
  grahas: {
    SURYA: 352.3117328932,
    CHANDRA: 252.3480673450,
    MANGALA: 68.0299637368,
    BUDHA: 5.1378080142,
    SHUKRA: 28.4049298315,
    GURU: 99.8832003998,
    SHANI: 281.7754137337,
    RAHU: 270.3452264390,
    KETU: 90.3452264390,
  },
} as const;

function assertClose(actual: number, expected: number, tolerance = 1e-6) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `Golden Chart mismatch: expected ${expected}, got ${actual}, delta=${actual - expected}`,
    );
  }
}

function julianDayUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const h =
    d.getUTCHours() +
    d.getUTCMinutes() / 60 +
    d.getUTCSeconds() / 3600;
  return h;
}

Deno.test("Golden Chart: Lahiri sidereal D1 regression", async () => {
  const se: any = await import(
    "jsr:@fusionstrings/swisseph-wasm@0.1.5/browser"
  );

  const birthUtc = julianDayUtc(1991, 4, 6, 8, 42);
  const jd = se.swe_julday(1991, 4, 6, birthUtc, SE.GREG_CAL);

  se.swe_set_sid_mode(SE.SIDM_LAHIRI, 0, 0);

  const ecl: any = se.swe_calc_ut(jd, SE.ECL_NUT, 0);
  const eclValues = ecl?.xx ?? ecl?.values;
  const epsTrue = Number.isFinite(ecl?.longitude)
    ? ecl.longitude
    : eclValues?.[0];
  const nutLon = Number.isFinite(ecl?.distance)
    ? ecl.distance
    : eclValues?.[2];

  if (!Number.isFinite(epsTrue) || !Number.isFinite(nutLon)) {
    throw new Error("Golden Chart: ECL_NUT result incomplete");
  }

  const siderealTimeHours = se.swe_sidtime(jd);
  const armc = norm(siderealTimeHours * 15 + 79.861244);
  const ayanamsa = se.swe_get_ayanamsa_ut(jd);

  const tropicalAsc = asc1(
    armc + 90,
    6.927079,
    sind(epsTrue),
    cosd(epsTrue),
  );
  const asc = norm(tropicalAsc - ayanamsa - nutLon);

  assertClose(asc, GOLDEN.lagna);

  const flags = SE.MOSEPH | SE.SIDEREAL | SE.SPEED;

  const calculated: Record<string, number> = {};

  for (const [code, body] of NATAL_BODIES) {
    const result: any = se.swe_calc_ut(jd, body, flags);
    const values = result?.xx ?? result?.values;
    const longitude = Number.isFinite(result?.longitude)
      ? result.longitude
      : values?.[0];

    if (!Number.isFinite(longitude)) {
      throw new Error(`Golden Chart: ${code} longitude missing`);
    }

    calculated[code] = norm(longitude);
  }

  const node: any = se.swe_calc_ut(jd, SE.MEAN_NODE, flags);
  const nodeValues = node?.xx ?? node?.values;
  const rahu = norm(
    Number.isFinite(node?.longitude) ? node.longitude : nodeValues?.[0],
  );

  if (!Number.isFinite(rahu)) {
    throw new Error("Golden Chart: Rahu longitude missing");
  }

  calculated.RAHU = rahu;
  calculated.KETU = norm(rahu + 180);

  for (const [code, expected] of Object.entries(GOLDEN.grahas)) {
    assertClose(calculated[code], expected);
  }

  if (rasi(asc).number !== 4) {
    throw new Error("Golden Chart: Lagna must be Cancer");
  }

  const expectedRasis = {
    SURYA: 12,
    CHANDRA: 9,
    MANGALA: 3,
    BUDHA: 1,
    SHUKRA: 1,
    GURU: 4,
    SHANI: 10,
    RAHU: 10,
    KETU: 4,
  } as const;

  for (const [code, expectedRasi] of Object.entries(expectedRasis)) {
    if (rasi(calculated[code]).number !== expectedRasi) {
      throw new Error(
        `Golden Chart: ${code} expected Rashi ${expectedRasi}, got ${rasi(calculated[code]).number}`,
      );
    }
  }

  const mappedSun = mapGraha(
    "SURYA",
    1,
    { longitude: calculated.SURYA, longitudeSpeed: 0 },
  );
  if (mappedSun.graha_id !== 1 || mappedSun.retrograde) {
    throw new Error("Golden Chart: Surya mapping regression failed");
  }

  const [mappedRahu, mappedKetu] = mapNodes({
    longitude: calculated.RAHU,
    longitudeSpeed: -0.05,
  });
  if (
    mappedRahu.graha_id !== 8 ||
    mappedKetu.graha_id !== 9 ||
    Math.abs(norm(mappedKetu.longitude) - calculated.KETU) > 1e-9
  ) {
    throw new Error("Golden Chart: Rahu/Ketu mapping regression failed");
  }

  const tropicalMc = mcFromArmc(armc, epsTrue);
  const mc = norm(tropicalMc - ayanamsa - nutLon);
  if (!Number.isFinite(mc)) {
    throw new Error("Golden Chart: MC calculation failed");
  }
});
