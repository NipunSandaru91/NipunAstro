/// <reference lib="deno.ns" />
import {
  buildPersonalDashaReading,
  buildPersonalTopicReading,
  type PersonalReadingAnchor,
} from "../../lib/prediction/ui/personal-topic-reading.ts";
import type { PredictionTopic } from "../../lib/prediction/evidence.ts";

const topics: PredictionTopic[] = [
  "CAREER",
  "EDUCATION",
  "RELATIONSHIP",
  "FINANCE",
  "HEALTH",
  "SPIRITUALITY",
];

const anchor: PersonalReadingAnchor = {
  sourceBhava: 10,
  sourceLabel: "වෘත්තිය",
  grahaId: 4,
  grahaLabel: "බුධ",
  rasiLabel: "මේෂ",
  targetBhava: 10,
  resultChannel: "වෘත්තීය භූමිකාව සහ සමාජ වගකීම",
  ruleText: "10 වන භාව අධිපති බුධ 10 වන භාවයේ මේෂ රාශියේ පිහිටයි",
  supporting: ["බුධ උච්ච රාශියේ පිහිටයි", "බුධ උච්ච රාශියේ පිහිටයි"],
  contradicting: ["ශනිගේ පූර්ණ දෘෂ්ටිය ලැබේ"],
  matchedRoles: ["මහදශා අධිපති", "අන්තර්දශා අධිපති"],
};

Deno.test("personal topic readings are detailed, chart-specific, and available for all topics", () => {
  for (const topic of topics) {
    for (const level of ["WEAK", "MODERATE", "STRONG"] as const) {
      const reading = buildPersonalTopicReading({ topic, level, anchors: [anchor] });
      if (
        reading.outcome.length < 160 ||
        reading.anchors[0]?.ruleText !== anchor.ruleText ||
        reading.anchors[0]?.resultChannel !== anchor.resultChannel ||
        reading.strengths.length !== 1 ||
        reading.cautions.length !== 1
      ) {
        throw new Error(`personal topic reading incomplete: ${topic}/${level}`);
      }
      if (topic === "HEALTH" && !reading.outcome.includes("වෛද්‍ය")) {
        throw new Error("health reading lost its medical boundary");
      }
    }
  }
});

Deno.test("dasha reading names the real D1 links and qualifies each activation level", () => {
  for (const topic of topics) {
    for (const activation of ["NONE", "MODERATE", "STRONG"] as const) {
      const reading = buildPersonalDashaReading({
        maha: "රවි",
        antar: "බුධ",
        anchors: [anchor],
        topic,
        activation,
      });
      if (
        !reading.includes("රවි මහදශාව") ||
        !reading.includes("බුධ අන්තර්දශාව") ||
        !reading.includes("මහදශා අධිපති සහ අන්තර්දශා අධිපති") ||
        !reading.includes("10 වන භාවයේ බුධ") ||
        reading.length < 200
      ) {
        throw new Error(`dasha reading lost chart provenance: ${topic}/${activation}`);
      }
      if (topic === "HEALTH" && !reading.includes("වෛද්‍ය")) {
        throw new Error("timed health reading lost its medical boundary");
      }
    }
  }
});

Deno.test("a dasha pair without a matching topic indicator is disclosed as background", () => {
  for (const topic of topics) {
    const reading = buildPersonalDashaReading({
      maha: "රවි",
      antar: "ශනි",
      anchors: [],
      topic,
      activation: "NONE",
    });
    if (!reading.includes("සෘජු ග්‍රහ ගැළපීමක්") && topic !== "HEALTH") {
      throw new Error(`unmatched period not disclosed: ${topic}`);
    }
    if (!reading.includes("පසුබිම් කාලයක්")) {
      throw new Error(`unmatched period described as a prediction: ${topic}`);
    }
  }
});
