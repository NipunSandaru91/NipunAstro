import type { GenericEvidenceLevel } from "./generic-dasha.ts";

export type GenericActivationLevel =
  | "NONE"
  | "WEAK"
  | "MODERATE"
  | "STRONG";

export type GenericTimingStatus =
  | "ACTIVE_NOW"
  | "DASHA_ACTIVE_WAITING_TRIGGER"
  | "TRANSIT_ONLY"
  | "DORMANT"
  | "TIMING_INCOMPLETE";

export type GenericTimingResult = {
  topic: string;
  theme_code: string;
  natal_level: GenericEvidenceLevel;
  status: GenericTimingStatus;
  level: GenericActivationLevel;
  data_complete: boolean;
  rule_version: "GENERIC_PREDICTION_TIMING_V1";
};

export function combineGenericTiming(input: {
  topic: string;
  themeCode: string;
  natalLevel: GenericEvidenceLevel;
  dasha:
    | {
        available: true;
        status: "ACTIVE" | "DORMANT";
        activation_level: "NONE" | "MODERATE" | "STRONG";
      }
    | { available: false };
  transit:
    | {
        available: true;
        status: "TRIGGERED" | "UNTRIGGERED";
        activation_level: "NONE" | "MODERATE" | "STRONG";
      }
    | { available: false };
}): GenericTimingResult {
  if (!input.dasha.available || !input.transit.available) {
    return {
      topic: input.topic,
      theme_code: input.themeCode,
      natal_level: input.natalLevel,
      status: "TIMING_INCOMPLETE",
      level: "NONE",
      data_complete: false,
      rule_version: "GENERIC_PREDICTION_TIMING_V1",
    };
  }

  const dashaActive = input.dasha.status === "ACTIVE";
  const transitActive = input.transit.status === "TRIGGERED";

  if (dashaActive && transitActive) {
    return {
      topic: input.topic,
      theme_code: input.themeCode,
      natal_level: input.natalLevel,
      status: "ACTIVE_NOW",
      level: "STRONG",
      data_complete: true,
      rule_version: "GENERIC_PREDICTION_TIMING_V1",
    };
  }

  if (dashaActive) {
    return {
      topic: input.topic,
      theme_code: input.themeCode,
      natal_level: input.natalLevel,
      status: "DASHA_ACTIVE_WAITING_TRIGGER",
      level: "MODERATE",
      data_complete: true,
      rule_version: "GENERIC_PREDICTION_TIMING_V1",
    };
  }

  if (transitActive) {
    return {
      topic: input.topic,
      theme_code: input.themeCode,
      natal_level: input.natalLevel,
      status: "TRANSIT_ONLY",
      level: "MODERATE",
      data_complete: true,
      rule_version: "GENERIC_PREDICTION_TIMING_V1",
    };
  }

  return {
    topic: input.topic,
    theme_code: input.themeCode,
    natal_level: input.natalLevel,
    status: "DORMANT",
    level: "WEAK",
    data_complete: true,
    rule_version: "GENERIC_PREDICTION_TIMING_V1",
  };
}

export function timingStatusSi(status: GenericTimingStatus) {
  const labels: Record<GenericTimingStatus, string> = {
    ACTIVE_NOW: "දශා සහ ගෝචර සාධක එකවර සක්‍රීයයි",
    DASHA_ACTIVE_WAITING_TRIGGER:
      "දශා සක්‍රීයයි; ගෝචර trigger එක තවම නොපෙනේ",
    TRANSIT_ONLY:
      "ගෝචර trigger එකක් ඇත; අදාල දශා සක්‍රීයතාව නොපෙනේ",
    DORMANT: "දශා සහ ගෝචර සක්‍රීයතාව දැනට නොපෙනේ",
    TIMING_INCOMPLETE:
      "දශා හෝ ගෝචර timing data සම්පූර්ණ නොවන නිසා නිගමනය නොකරයි",
  };
  return labels[status];
}
