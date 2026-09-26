/// <reference lib="deno.ns" />

import { evaluateBhavaLordPlacement } from "../../lib/prediction/rules/bhava-lord-placement.ts";

const GOLDEN_POSITIONS = [
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

Deno.test("Golden Chart: 10th lord Mars is derived in Gemini 12th bhava", () => {
  const evidence = evaluateBhavaLordPlacement({
    lagnaRasiId: 4,
    sourceBhava: 10,
    positions: GOLDEN_POSITIONS,
    topic: "CAREER",
    polarity: "SUPPORTING",
  });

  if (evidence.placement.graha_id !== 3) throw new Error("10th lord must be Mars");
  if (evidence.placement.rasi_id !== 3) throw new Error("Mars must be in Gemini");
  if (evidence.placement.bhava !== 12) throw new Error("Mars must be in 12th bhava");
  if (evidence.qualities.graha.name_si !== "කුජ") throw new Error("Mars Sinhala quality missing");
  if (evidence.qualities.rasi.name_si !== "මිථුන") throw new Error("Gemini Sinhala quality missing");
  if (!evidence.qualities.bhava.keywords_si.includes("විදේශ")) throw new Error("12th bhava quality missing");
  if (evidence.rule.code !== "BHAVA_LORD_PLACEMENT") throw new Error("rule trace missing");
  if (!evidence.rule.text_si.includes("10 වන භාව අධිපති කුජ") ||
      !evidence.rule.text_si.includes("12 වන භාවයේ මිථුන රාශියේ")) {
    throw new Error("Sinhala derived rule explanation changed");
  }
});

Deno.test("bhava lord rule rejects missing lord position", () => {
  let failed=false;
  try {
    evaluateBhavaLordPlacement({
      lagnaRasiId: 4,
      sourceBhava: 10,
      positions: GOLDEN_POSITIONS.filter((p)=>p.graha_id!==3),
      topic: "CAREER",
      polarity: "SUPPORTING",
    });
  } catch (error) {
    failed = error instanceof Error && error.message === "BHAVA_LORD_POSITION_MISSING";
  }
  if (!failed) throw new Error("missing lord position must fail explicitly");
});
