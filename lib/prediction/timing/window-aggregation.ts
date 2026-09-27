import type {
  GenericActivationLevel,
  GenericTimingStatus,
} from "./generic-timing.ts";
import type { PredictionWindowType } from "./prediction-window.ts";

export type PredictionWindowState =
  | "ACTIVE_WINDOW"
  | "DASHA_WINDOW"
  | "TRANSIT_WINDOW"
  | "DORMANT_WINDOW"
  | "INCOMPLETE_WINDOW";

export type WindowTimingSample = {
  sample_at: string;
  local_key: string;
  status: GenericTimingStatus;
  level: GenericActivationLevel;
  transit_trigger_count: number;
};

export type PredictionWindowAggregation = {
  topic: string;
  theme_code: string;
  window_type: PredictionWindowType;
  window_state: PredictionWindowState;
  peak_status: GenericTimingStatus;
  peak_level: GenericActivationLevel;
  expected_samples: number;
  observed_samples: number;
  coverage_complete: boolean;
  active_now_samples: number;
  dasha_active_samples: number;
  transit_triggered_samples: number;
  dormant_samples: number;
  incomplete_samples: number;
  sample_activation_fraction: number;
  first_active_at: string | null;
  last_active_at: string | null;
  peak_samples: string[];
  rule_version: "PREDICTION_WINDOW_AGGREGATION_V1";
};

const statusPriority: Record<GenericTimingStatus, number> = {
  ACTIVE_NOW: 5,
  DASHA_ACTIVE_WAITING_TRIGGER: 4,
  TRANSIT_ONLY: 3,
  DORMANT: 2,
  TIMING_INCOMPLETE: 1,
};

const levelPriority: Record<GenericActivationLevel, number> = {
  STRONG: 4,
  MODERATE: 3,
  WEAK: 2,
  NONE: 1,
};

function maxStatus(samples: readonly WindowTimingSample[]) {
  return samples.reduce<GenericTimingStatus>(
    (best, item) =>
      statusPriority[item.status] > statusPriority[best] ? item.status : best,
    "TIMING_INCOMPLETE",
  );
}

function maxLevel(samples: readonly WindowTimingSample[]) {
  return samples.reduce<GenericActivationLevel>(
    (best, item) =>
      levelPriority[item.level] > levelPriority[best] ? item.level : best,
    "NONE",
  );
}

export function aggregatePredictionWindow(input: {
  topic: string;
  themeCode: string;
  windowType: PredictionWindowType;
  expectedSamples: number;
  samples: readonly WindowTimingSample[];
}): PredictionWindowAggregation {
  if (input.expectedSamples <= 0) throw new Error("INVALID_EXPECTED_SAMPLES");

  const activeNow = input.samples.filter(
    (sample) => sample.status === "ACTIVE_NOW",
  );
  const dashaActive = input.samples.filter(
    (sample) =>
      sample.status === "ACTIVE_NOW" ||
      sample.status === "DASHA_ACTIVE_WAITING_TRIGGER",
  );
  const transitTriggered = input.samples.filter(
    (sample) =>
      sample.status === "ACTIVE_NOW" || sample.status === "TRANSIT_ONLY",
  );
  const dormant = input.samples.filter((sample) => sample.status === "DORMANT");
  const incomplete = input.samples.filter(
    (sample) => sample.status === "TIMING_INCOMPLETE",
  );

  const coverageComplete =
    input.samples.length === input.expectedSamples && incomplete.length === 0;

  let windowState: PredictionWindowState;
  if (!coverageComplete) windowState = "INCOMPLETE_WINDOW";
  else if (activeNow.length) windowState = "ACTIVE_WINDOW";
  else if (dashaActive.length) windowState = "DASHA_WINDOW";
  else if (transitTriggered.length) windowState = "TRANSIT_WINDOW";
  else windowState = "DORMANT_WINDOW";

  const peakStatus = maxStatus(input.samples);
  const peakLevel = maxLevel(input.samples);
  const peakSamples = input.samples
    .filter((sample) => sample.status === peakStatus)
    .map((sample) => sample.sample_at);

  return {
    topic: input.topic,
    theme_code: input.themeCode,
    window_type: input.windowType,
    window_state: windowState,
    peak_status: peakStatus,
    peak_level: peakLevel,
    expected_samples: input.expectedSamples,
    observed_samples: input.samples.length,
    coverage_complete: coverageComplete,
    active_now_samples: activeNow.length,
    dasha_active_samples: dashaActive.length,
    transit_triggered_samples: transitTriggered.length,
    dormant_samples: dormant.length,
    incomplete_samples: incomplete.length,
    sample_activation_fraction: activeNow.length / input.expectedSamples,
    first_active_at: activeNow[0]?.sample_at ?? null,
    last_active_at: activeNow[activeNow.length - 1]?.sample_at ?? null,
    peak_samples: peakSamples,
    rule_version: "PREDICTION_WINDOW_AGGREGATION_V1",
  };
}

export function windowStateSi(state: PredictionWindowState) {
  const text: Record<PredictionWindowState, string> = {
    ACTIVE_WINDOW:
      "මෙම කාල කවුළුව තුළ ජන්ම තේමාවට දශා සහ ගෝචර සාධක එකවර සක්‍රීය වන sample ඇත.",
    DASHA_WINDOW:
      "මෙම කාල කවුළුව තුළ දශා සක්‍රීයතාව පවතින නමුත් එකවර ගෝචර trigger එකක් හමු නොවීය.",
    TRANSIT_WINDOW:
      "මෙම කාල කවුළුව තුළ ගෝචර trigger ඇත, නමුත් අදාල දශා සක්‍රීයතාව එකවර හමු නොවීය.",
    DORMANT_WINDOW:
      "සැලසුම් කළ samples තුළ අදාල දශා හෝ ගෝචර සක්‍රීයතාව හමු නොවීය.",
    INCOMPLETE_WINDOW:
      "අවශ්‍ය samples හෝ timing data සම්පූර්ණ නැති නිසා window-level නිගමනයක් නිකුත් නොකරයි.",
  };
  return text[state];
}
