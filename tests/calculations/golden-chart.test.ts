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
  retrograde: {
    SURYA: false,
    CHANDRA: false,
    MANGALA: false,
    BUDHA: true,
    SHUKRA: false,
    GURU: false,
    SHANI: false,
    RAHU: true,
    KETU: false,
  },
  nakshatra: {
    LAGNA: 8,
    SURYA: 26,
    CHANDRA: 18,
    MANGALA: 5,
    BUDHA: 0,
    SHUKRA: 2,
    GURU: 7,
    SHANI: 21,
    RAHU: 20,
    KETU: 6,
  },
  pada: {
    LAGNA: 2,
    SURYA: 2,
    CHANDRA: 4,
    MANGALA: 1,
    BUDHA: 2,
    SHUKRA: 1,
    GURU: 2,
    SHANI: 1,
    RAHU: 2,
    KETU: 4,
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
  return (
    d.getUTCHours() +
    d.getUTCMinutes() / 60 +
    d.getUTCSeconds() / 3600
  );
}

function nakshatraIndex(longitude: number) {
  return Math.floor(norm(longitude) / (360 / 27));
}

function pada(longitude: number) {
  return Math.floor((norm(longitude) % (360 / 27)) / (360 / 108)) + 1;
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

  if (rasi(asc).number !== 4) {
    throw new Error("Golden Chart: Lagna must be Cancer");
  }
  if (nakshatraIndex(asc) !== GOLDEN.nakshatra.LAGNA) {
    throw new Error("Golden Chart: Lagna Nakshatra mismatch");
  }
  if (pada(asc) !== GOLDEN.pada.LAGNA) {
    throw new Error("Golden Chart: Lagna Pada mismatch");
  }

  const flags = SE.MOSEPH | SE.SIDEREAL | SE.SPEED;
  const calculated: Record<string, number> = {};
  const retrograde: Record<string, boolean> = {};

  for (const [code, body] of NATAL_BODIES) {
    const result: any = se.swe_calc_ut(jd, body, flags);
    const values = result?.xx ?? result?.values;
    const longitude = Number.isFinite(result?.longitude)
      ? result.longitude
      : values?.[0];
    const speed = Number.isFinite(result?.longitudeSpeed)
      ? result.longitudeSpeed
      : Number.isFinite(result?.longitude_speed)
      ? result.longitude_speed
      : Number.isFinite(result?.speed_long)
      ? result.speed_long
      : Number.isFinite(result?.speed_longitude)
      ? result.speed_longitude
      : values?.[3];

    if (!Number.isFinite(longitude) || !Number.isFinite(speed)) {
      throw new Error(`Golden Chart: ${code} result incomplete`);
    }

    calculated[code] = norm(longitude);
    retrograde[code] = speed < 0;
  }

  const node: any = se.swe_calc_ut(jd, SE.MEAN_NODE, flags);
  const nodeValues = node?.xx ?? node?.values;
  const rahu = norm(
    Number.isFinite(node?.longitude) ? node.longitude : nodeValues?.[0],
  );
  const rahuSpeed = Number.isFinite(node?.longitudeSpeed)
    ? node.longitudeSpeed
    : Number.isFinite(node?.longitude_speed)
    ? node.longitude_speed
    : Number.isFinite(node?.speed_long)
    ? node.speed_long
    : Number.isFinite(node?.speed_longitude)
    ? node.speed_longitude
    : nodeValues?.[3];

  if (!Number.isFinite(rahu) || !Number.isFinite(rahuSpeed)) {
    throw new Error("Golden Chart: Rahu result incomplete");
  }

  calculated.RAHU = rahu;
  calculated.KETU = norm(rahu + 180);
  retrograde.RAHU = rahuSpeed < 0;
  retrograde.KETU = rahuSpeed > 0;

  for (const [code, expected] of Object.entries(GOLDEN.grahas)) {
    assertClose(calculated[code], expected);
  }

  for (const [code, expected] of Object.entries(GOLDEN.retrograde)) {
    if (retrograde[code] !== expected) {
      throw new Error(
        `Golden Chart: ${code} retrograde expected ${expected}, got ${retrograde[code]}`,
      );
    }
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

  for (const [code, expected] of Object.entries(GOLDEN.nakshatra)) {
    const actual = code === "LAGNA"
      ? nakshatraIndex(asc)
      : nakshatraIndex(calculated[code]);
    if (actual !== expected) {
      throw new Error(
        `Golden Chart: ${code} Nakshatra expected ${expected}, got ${actual}`,
      );
    }
  }

  for (const [code, expected] of Object.entries(GOLDEN.pada)) {
    const actual = code === "LAGNA"
      ? pada(asc)
      : pada(calculated[code]);
    if (actual !== expected) {
      throw new Error(
        `Golden Chart: ${code} Pada expected ${expected}, got ${actual}`,
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

Deno.test("Golden Chart: Tanamalwila 1996-12-01 11:45 locks Aquarius lagna boundary case", async () => {
  const se: any = await import(
    "jsr:@fusionstrings/swisseph-wasm@0.1.5/browser"
  );

  // Historical Sri Lanka local time on 1996-12-01 was UTC+06:00.
  // This regression intentionally uses Tanamalwila coordinates because the
  // same civil time at Colombo crosses the Makara/Kumbha rashi boundary.
  const birthUtc = julianDayUtc(1996, 12, 1, 5, 45);
  const jd = se.swe_julday(1996, 12, 1, birthUtc, SE.GREG_CAL);

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
    throw new Error("Tanamalwila regression: ECL_NUT result incomplete");
  }

  const siderealTimeHours = se.swe_sidtime(jd);
  const armc = norm(siderealTimeHours * 15 + 81.1285);
  const ayanamsa = se.swe_get_ayanamsa_ut(jd);
  const tropicalAsc = asc1(
    armc + 90,
    6.4331,
    sind(epsTrue),
    cosd(epsTrue),
  );
  const asc = norm(tropicalAsc - ayanamsa - nutLon);

  assertClose(asc, 300.0543618550);

  if (rasi(asc).number !== 11) {
    throw new Error(
      `Tanamalwila regression: Lagna must remain Kumbha (Aquarius), got Rashi ${rasi(asc).number}`,
    );
  }
});
