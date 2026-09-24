/// <reference lib="deno.ns" />

import {
  allGrahaAspects,
  aspectTargetRasi,
  grahaAspectOffsets,
  grahaAspects,
} from "../../supabase/functions/jyotisha-calculator/core/drishti.ts";

Deno.test("matches locked Parashari Graha Drishti offsets", () => {
  const expected = {
    1: [7], 2: [7], 3: [4, 7, 8], 4: [7],
    5: [5, 7, 9], 6: [7], 7: [3, 7, 10],
    8: [7], 9: [7],
  };

  for (const [graha, offsets] of Object.entries(expected)) {
    if (grahaAspectOffsets(Number(graha)).join(",") !== offsets.join(",")) {
      throw new Error("Graha " + graha + " aspect mapping failed");
    }
  }
});

Deno.test("calculates target rasi and bhava from source rasi", () => {
  if (aspectTargetRasi(4, 7) !== 10) throw new Error("Seventh target failed");
  if (aspectTargetRasi(1, 10) !== 10) throw new Error("Tenth target failed");
  if (aspectTargetRasi(12, 5) !== 4) throw new Error("Wrapped target failed");
});

Deno.test("calculates Mars, Jupiter and Saturn special aspects", () => {
  const mars = grahaAspects(3, 3, 4);
  const jupiter = grahaAspects(5, 4, 4);
  const saturn = grahaAspects(7, 10, 4);

  if (mars.map((x) => x.house_offset).join(",") !== "4,7,8") {
    throw new Error("Mars aspects failed");
  }
  if (jupiter.map((x) => x.house_offset).join(",") !== "5,7,9") {
    throw new Error("Jupiter aspects failed");
  }
  if (saturn.map((x) => x.house_offset).join(",") !== "3,7,10") {
    throw new Error("Saturn aspects failed");
  }
  if (!mars.every((x) => x.strength_fraction === 1 && x.aspect_type === "FULL")) {
    throw new Error("Aspect strength/type failed");
  }
  if (!mars[0].is_special || mars[1].is_special) {
    throw new Error("Special aspect flag failed");
  }
});

Deno.test("uses seventh-only aspect for Rahu and Ketu", () => {
  if (grahaAspectOffsets(8).join(",") !== "7") throw new Error("Rahu rule failed");
  if (grahaAspectOffsets(9).join(",") !== "7") throw new Error("Ketu rule failed");
});

Deno.test("matches Golden Chart aspect targets from Cancer Lagna", () => {
  const positions = [
    { graha_id: 1, rasi_id: 12 },
    { graha_id: 2, rasi_id: 9 },
    { graha_id: 3, rasi_id: 3 },
    { graha_id: 4, rasi_id: 1 },
    { graha_id: 5, rasi_id: 4 },
    { graha_id: 6, rasi_id: 1 },
    { graha_id: 7, rasi_id: 10 },
    { graha_id: 8, rasi_id: 10 },
    { graha_id: 9, rasi_id: 4 },
  ];
  const aspects = allGrahaAspects(positions, 4);
  if (aspects.length !== 15) throw new Error("Expected 17 Golden Chart aspects");

  const mars = aspects.filter((x) => x.source_graha_id === 3);
  if (mars.map((x) => x.target_bhava_number).join(",") !== "3,6,7") {
    throw new Error("Golden Chart Mars aspects failed");
  }
  const jupiter = aspects.filter((x) => x.source_graha_id === 5);
  if (jupiter.map((x) => x.target_bhava_number).join(",") !== "5,7,9") {
    throw new Error("Golden Chart Jupiter aspects failed");
  }
});

Deno.test("rejects invalid Graha and house inputs", () => {
  for (const value of [0, 10, 1.5, Number.NaN]) {
    let failed = false;
    try { grahaAspectOffsets(value); } catch { failed = true; }
    if (!failed) throw new Error("Invalid graha accepted");
  }

  let failed = false;
  try { aspectTargetRasi(4, 13); } catch { failed = true; }
  if (!failed) throw new Error("Invalid house offset accepted");
});
