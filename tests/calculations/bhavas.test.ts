/// <reference lib="deno.ns" />

import {
  allBhavas,
  bhavaLordGrahaId,
  bhavaRasiId,
  houseFromRasi,
} from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";

Deno.test("maps whole-sign houses from Cancer Lagna", () => {
  const bhavas = allBhavas(4);
  if (bhavas.length !== 12) throw new Error("Expected 12 bhavas");

  const expectedRasis = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const actualRasis = bhavas.map((item) => item.rasi_id);
  if (actualRasis.join(",") !== expectedRasis.join(",")) {
    throw new Error("Whole-sign bhava sequence failed");
  }
});

Deno.test("maps planet rasi to whole-sign house", () => {
  if (houseFromRasi(4, 4) !== 1) throw new Error("Lagna rasi house failed");
  if (houseFromRasi(4, 10) !== 7) throw new Error("Capricorn house failed");
  if (houseFromRasi(4, 3) !== 12) throw new Error("Gemini house failed");
});

Deno.test("maps classical rasi lords", () => {
  const expected = {
    1: 3,
    2: 6,
    3: 4,
    4: 2,
    5: 1,
    6: 4,
    7: 6,
    8: 3,
    9: 5,
    10: 7,
    11: 7,
    12: 5,
  };

  for (const [rasiId, lord] of Object.entries(expected)) {
    if (bhavaLordGrahaId(Number(rasiId)) !== lord) {
      throw new Error("Rasi " + rasiId + " lord mismatch");
    }
  }
});

Deno.test("maps bhava to rasi and lord", () => {
  if (bhavaRasiId(4, 1) !== 4) throw new Error("First bhava rasi failed");
  if (bhavaRasiId(4, 10) !== 1) throw new Error("Tenth bhava rasi failed");

  const bhavas = allBhavas(4);
  const tenth = bhavas[9];
  if (tenth.bhava !== 10 || tenth.rasi_id !== 1 || tenth.lord_graha_id !== 3) {
    throw new Error("Tenth bhava mapping failed");
  }
});

Deno.test("rejects invalid rasi and bhava inputs", () => {
  for (const value of [0, 13, 1.5, Number.NaN]) {
    let failed = false;
    try {
      houseFromRasi(value, 1);
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("Invalid Lagna rasi was accepted");
  }

  let failed = false;
  try {
    bhavaRasiId(4, 13);
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Invalid bhava was accepted");
});
