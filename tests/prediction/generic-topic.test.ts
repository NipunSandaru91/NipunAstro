/// <reference lib="deno.ns" />
import {
  buildGenericTopicNatalModel,
  parsePredictionTopic,
  TOPIC_LABEL_SI,
} from "../../lib/prediction/topics/generic-topic.ts";

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

const shadbala = [1, 2, 3, 4, 5, 6, 7].map((graha_id) => ({
  graha_id,
  total_bala_rupa: 10,
}));

Deno.test("generic topic parser supports every prediction topic and defaults to career", () => {
  for (const topic of [
    "EDUCATION",
    "RELATIONSHIP",
    "FINANCE",
    "HEALTH",
    "SPIRITUALITY",
  ] as const) {
    if (parsePredictionTopic(topic) !== topic) {
      throw new Error("topic parse failed: " + topic);
    }
    if (!TOPIC_LABEL_SI[topic]) {
      throw new Error("Sinhala label missing: " + topic);
    }
  }

  if (parsePredictionTopic("CAREER") !== "CAREER") {
    throw new Error("career default changed");
  }
  if (parsePredictionTopic("UNKNOWN") !== "CAREER") {
    throw new Error("invalid topic did not default to career");
  }
  if (parsePredictionTopic(undefined) !== "CAREER") {
    throw new Error("undefined topic did not default to career");
  }
  if (!TOPIC_LABEL_SI.CAREER) {
    throw new Error("career Sinhala label missing");
  }
});

Deno.test("generic natal models expose evidence-backed themes for all non-career topics", () => {
  const expected = {
    EDUCATION: { primary: 3, contextual: 2, themes: 3 },
    RELATIONSHIP: { primary: 3, contextual: 2, themes: 3 },
    FINANCE: { primary: 2, contextual: 4, themes: 3 },
    HEALTH: { primary: 3, contextual: 1, themes: 2 },
    SPIRITUALITY: { primary: 2, contextual: 2, themes: 3 },
  } as const;

  for (const topic of Object.keys(expected) as Array<keyof typeof expected>) {
    const model = buildGenericTopicNatalModel(topic, {
      lagnaRasiId: 4,
      positions,
      shadbala,
    });
    const shape = expected[topic];

    if (
      model.topic !== topic ||
      model.model_version !== "GENERIC_TOPIC_NATAL_V1" ||
      model.primary.length !== shape.primary ||
      model.contextual.length !== shape.contextual ||
      model.themes.length !== shape.themes
    ) {
      throw new Error("topic model shape changed: " + topic);
    }

    for (const theme of model.themes) {
      if (
        !theme.code ||
        !theme.text_si ||
        !theme.evidence_refs.length ||
        !theme.evidence_grahas.length ||
        !theme.evidence_houses.length ||
        theme.rule_version !== "GENERIC_TOPIC_THEMES_V1"
      ) {
        throw new Error("theme trace incomplete: " + topic + "/" + theme.code);
      }

      for (const ref of theme.evidence_refs) {
        if (!/^\d+L-\d+H-G\d+$/.test(ref)) {
          throw new Error("invalid evidence ref: " + ref);
        }
      }
    }
  }
});

Deno.test("health model remains a non-diagnostic wellbeing layer", () => {
  const health = buildGenericTopicNatalModel("HEALTH", {
    lagnaRasiId: 4,
    positions,
    shadbala,
  });
  const text = health.themes.map((theme) => theme.text_si).join(" ");
  if (!text.includes("non-diagnostic") || !text.includes("සුවතාව")) {
    throw new Error("health safety framing was removed");
  }
});
