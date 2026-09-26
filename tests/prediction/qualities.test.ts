/// <reference lib="deno.ns" />

import {
  bhavaQualitySi,
  grahaQualitySi,
  rasiQualitySi,
} from "../../lib/prediction/qualities.ts";
import { createPlacementEvidence } from "../../lib/prediction/evidence.ts";

Deno.test("Sinhala Jyotisa quality catalog exposes graha rasi and bhava meanings", () => {
  const mars = grahaQualitySi(3);
  if (mars.name_si !== "කුජ" || !mars.keywords_si.includes("ක්‍රියාශීලීත්වය")) {
    throw new Error("Mars quality contract changed");
  }

  const gemini = rasiQualitySi(3);
  if (gemini.name_si !== "මිථුන" || gemini.element_si !== "වායු" ||
      gemini.lord_graha_id !== 4 || !gemini.keywords_si.includes("සන්නිවේදනය")) {
    throw new Error("Gemini quality contract changed");
  }

  const twelfth = bhavaQualitySi(12);
  if (!twelfth.keywords_si.includes("විදේශ") || !twelfth.keywords_si.includes("වියදම්")) {
    throw new Error("12th bhava quality contract changed");
  }
});

Deno.test("quality catalog rejects unknown identifiers", () => {
  for (const call of [
    () => grahaQualitySi(0),
    () => rasiQualitySi(13),
    () => bhavaQualitySi(0),
  ]) {
    let failed = false;
    try { call(); } catch { failed = true; }
    if (!failed) throw new Error("unknown quality identifier must fail");
  }
});

Deno.test("Golden career evidence carries Sinhala qualities and rule trace", () => {
  const evidence = createPlacementEvidence({
    id: "golden-career-10l-mars-12h",
    topic: "CAREER",
    polarity: "SUPPORTING",
    grahaId: 3,
    rasiId: 3,
    bhava: 12,
    ruleCode: "BHAVA_LORD_PLACEMENT",
    ruleTextSi: "10 වන භාව අධිපති කුජ 12 වන භාවයේ මිථුන රාශියේ පිහිටයි",
    source: { kind: "NATAL_D1", engineVersion: "D1_V1" },
  });

  if (evidence.qualities.graha.name_si !== "කුජ") throw new Error("Golden graha quality missing");
  if (evidence.qualities.rasi.name_si !== "මිථුන") throw new Error("Golden rasi quality missing");
  if (!evidence.qualities.bhava.keywords_si.includes("විදේශ")) {
    throw new Error("Golden bhava quality missing");
  }
});
