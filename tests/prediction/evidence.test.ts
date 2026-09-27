/// <reference lib="deno.ns" />

import {
  createPlacementEvidence,
  type PredictionEvidence,
} from "../../lib/prediction/evidence.ts";

Deno.test("prediction evidence preserves traceable Jyotisa placement context", () => {
  const evidence: PredictionEvidence = createPlacementEvidence({
    id: "career-10l-12h",
    topic: "CAREER",
    polarity: "SUPPORTING",
    grahaId: 3,
    rasiId: 3,
    bhava: 12,
    ruleCode: "BHAVA_LORD_PLACEMENT",
    ruleTextSi: "10 වන භාව අධිපති 12 වන භාවයේ පිහිටයි",
    source: { kind: "NATAL_D1", engineVersion: "D1_V1" },
  });

  if (evidence.id !== "career-10l-12h") throw new Error("evidence id changed");
  if (evidence.topic !== "CAREER" || evidence.polarity !== "SUPPORTING") {
    throw new Error("topic or polarity changed");
  }
  if (evidence.placement.graha_id !== 3 || evidence.placement.rasi_id !== 3 ||
      evidence.placement.bhava !== 12) {
    throw new Error("placement evidence changed");
  }
  if (evidence.rule.code !== "BHAVA_LORD_PLACEMENT") throw new Error("rule code changed");
  if (evidence.rule.text_si !== "10 වන භාව අධිපති 12 වන භාවයේ පිහිටයි") {
    throw new Error("Sinhala rule explanation changed");
  }
  if (evidence.source.kind !== "NATAL_D1" || evidence.source.engine_version !== "D1_V1") {
    throw new Error("source traceability changed");
  }
});

Deno.test("prediction evidence rejects invalid placement coordinates", () => {
  for (const input of [
    { grahaId: 0, rasiId: 3, bhava: 12 },
    { grahaId: 3, rasiId: 13, bhava: 12 },
    { grahaId: 3, rasiId: 3, bhava: 0 },
  ]) {
    let failed = false;
    try {
      createPlacementEvidence({
        id: "invalid",
        topic: "CAREER",
        polarity: "SUPPORTING",
        ...input,
        ruleCode: "TEST",
        ruleTextSi: "පරීක්ෂණ නීතිය",
        source: { kind: "NATAL_D1", engineVersion: "D1_V1" },
      });
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("invalid placement must fail");
  }
});
