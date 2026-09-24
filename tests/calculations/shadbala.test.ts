/// <reference lib="deno.ns" />

import {
  SHADBALA_GRAHAS,
  aggregateShadbala,
  assertClassicalGraha,
} from "../../supabase/functions/jyotisha-calculator/core/shadbala.ts";

Deno.test("locks classical seven-graha Shadbala scope", () => {
  if (SHADBALA_GRAHAS.join(",") !== "1,2,3,4,5,6,7") {
    throw new Error("Shadbala graha scope changed");
  }
});

Deno.test("aggregates six Virupa components into Rupa", () => {
  const result = aggregateShadbala({
    sthana_bala: 54.10391096,
    dig_bala: 50.64628208,
    kala_bala: 75.67877815,
    cheshta_bala: 76.15250258,
    naisargika_bala: 60,
    drik_bala: 89.73390397,
  });

  const expected = 406.31539774;
  if (Math.abs(result.total_bala_virupa - expected) > 1e-8) {
    throw new Error("Shadbala Virupa sum failed");
  }
  if (Math.abs(result.total_bala_rupa - expected / 60) > 1e-10) {
    throw new Error("Shadbala Rupa conversion failed");
  }
  if (result.unit !== "RUPA") throw new Error("Shadbala unit failed");
  if (result.calculation_version !== "SHADBALA_AGGREGATION_V1") {
    throw new Error("Shadbala version failed");
  }
});

Deno.test("preserves negative Dṛk Bala in aggregation", () => {
  const result = aggregateShadbala({
    sthana_bala: 13.11602245,
    dig_bala: 42.67493977,
    kala_bala: 77.64244370,
    cheshta_bala: 66.64244370,
    naisargika_bala: 51.43,
    drik_bala: -13.53050042,
  });

  const expected = 238.0;
  if (Math.abs(result.total_bala_virupa - expected) > 1e-8) {
    throw new Error("Negative Dṛk Bala was not preserved");
  }
  if (Math.abs(result.total_bala_rupa - 3.96625582) > 1e-8) {
    throw new Error("Golden Moon Rupa aggregation failed");
  }
});

Deno.test("rejects non-finite component values", () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    let failed = false;
    try {
      aggregateShadbala({
        sthana_bala: value,
        dig_bala: 0,
        kala_bala: 0,
        cheshta_bala: 0,
        naisargika_bala: 0,
        drik_bala: 0,
      });
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("Non-finite component accepted");
  }
});

Deno.test("rejects non-classical grahas", () => {
  for (const value of [0, 8, 9, 1.5, Number.NaN]) {
    let failed = false;
    try {
      assertClassicalGraha(value);
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("Invalid Shadbala graha accepted");
  }
  assertClassicalGraha(1);
  assertClassicalGraha(7);
});
