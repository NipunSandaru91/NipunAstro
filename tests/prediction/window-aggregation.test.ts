/// <reference lib="deno.ns" />
import {
  buildPredictionWindowPlan,
  localDateInTimezone,
  parsePredictionWindowType,
  utcTimestampToLocalSampleKey,
} from "../../lib/prediction/timing/prediction-window.ts";
import {
  aggregatePredictionWindow,
  windowStateSi,
  type WindowTimingSample,
} from "../../lib/prediction/timing/window-aggregation.ts";

function throws(fn: () => unknown, message: string) {
  let ok = false;
  try {
    fn();
  } catch {
    ok = true;
  }
  if (!ok) throw new Error(message);
}

Deno.test("prediction window planner builds daily, weekly, monthly and yearly sampling plans", () => {
  const daily = buildPredictionWindowPlan("DAILY", "2026-09-27");
  if (
    daily.samples.length !== 4 ||
    daily.start_date !== "2026-09-27" ||
    daily.end_date !== "2026-09-27" ||
    daily.transit_graha_ids.length !== 9
  ) {
    throw new Error("daily sampling plan changed");
  }

  const weekly = buildPredictionWindowPlan("WEEKLY", "2026-09-27");
  if (
    weekly.samples.length !== 7 ||
    weekly.end_date !== "2026-10-03" ||
    weekly.label !== "2026-09-27 → 2026-10-03"
  ) {
    throw new Error("weekly sampling plan changed");
  }

  const monthlyThirty = buildPredictionWindowPlan("MONTHLY", "2026-09-27");
  if (
    monthlyThirty.start_date !== "2026-09-01" ||
    monthlyThirty.end_date !== "2026-09-30" ||
    monthlyThirty.samples.length !== 16 ||
    monthlyThirty.samples.at(-1)?.local_date !== "2026-09-30" ||
    monthlyThirty.transit_graha_ids.includes(2)
  ) {
    throw new Error("30-day monthly sampling plan changed");
  }

  const monthlyThirtyOne = buildPredictionWindowPlan("MONTHLY", "2026-01-09");
  if (
    monthlyThirtyOne.samples.length !== 16 ||
    monthlyThirtyOne.samples.at(-1)?.local_date !== "2026-01-31"
  ) {
    throw new Error("31-day monthly sampling plan changed");
  }

  const yearly = buildPredictionWindowPlan("YEARLY", "2026-09-27");
  if (
    yearly.samples.length !== 12 ||
    yearly.start_date !== "2026-01-01" ||
    yearly.end_date !== "2026-12-31" ||
    yearly.transit_graha_ids.join(",") !== "5,7,8,9"
  ) {
    throw new Error("yearly sampling plan changed");
  }

  if (
    !daily.query_utc_start.startsWith("2026-09-25") ||
    !daily.query_utc_end.startsWith("2026-09-30")
  ) {
    throw new Error("broad UTC query bounds changed");
  }
});

Deno.test("window type parser falls back to daily and preserves supported values", () => {
  if (parsePredictionWindowType("WEEKLY") !== "WEEKLY") {
    throw new Error("weekly parse failed");
  }
  if (parsePredictionWindowType("MONTHLY") !== "MONTHLY") {
    throw new Error("monthly parse failed");
  }
  if (parsePredictionWindowType("YEARLY") !== "YEARLY") {
    throw new Error("yearly parse failed");
  }
  if (parsePredictionWindowType("DAILY") !== "DAILY") {
    throw new Error("daily parse failed");
  }
  if (parsePredictionWindowType("bad") !== "DAILY") {
    throw new Error("invalid type did not fall back");
  }
  if (parsePredictionWindowType(undefined) !== "DAILY") {
    throw new Error("undefined type did not fall back");
  }
});

Deno.test("window planner rejects malformed and impossible anchor dates", () => {
  throws(
    () => buildPredictionWindowPlan("DAILY", "2026/09/27"),
    "malformed date accepted",
  );
  throws(
    () => buildPredictionWindowPlan("DAILY", "2026-02-30"),
    "impossible date accepted",
  );
});

Deno.test("UTC timestamps are matched back to local sample keys", () => {
  const tokyo = utcTimestampToLocalSampleKey(
    "2026-09-27T03:00:00.000Z",
    "Asia/Tokyo",
  );
  if (tokyo !== "2026-09-27T12:00") {
    throw new Error("Tokyo sample key conversion failed: " + tokyo);
  }

  const newYork = utcTimestampToLocalSampleKey(
    "2026-09-27T16:00:00.000Z",
    "America/New_York",
  );
  if (newYork !== "2026-09-27T12:00") {
    throw new Error("New York sample key conversion failed: " + newYork);
  }

  const date = localDateInTimezone(
    new Date("2026-09-27T16:00:00.000Z"),
    "Asia/Tokyo",
  );
  if (date !== "2026-09-28") {
    throw new Error("local date conversion failed: " + date);
  }
});

const sample = (
  index: number,
  status: WindowTimingSample["status"],
  level: WindowTimingSample["level"],
): WindowTimingSample => ({
  sample_at: "2026-09-" + String(index + 1).padStart(2, "0") + "T12:00:00Z",
  local_key: "2026-09-" + String(index + 1).padStart(2, "0") + "T12:00",
  status,
  level,
  transit_trigger_count: status === "ACTIVE_NOW" || status === "TRANSIT_ONLY" ? 1 : 0,
});

Deno.test("window aggregation reports active convergence and peak samples", () => {
  const result = aggregatePredictionWindow({
    topic: "CAREER",
    themeCode: "X",
    windowType: "WEEKLY",
    expectedSamples: 3,
    samples: [
      sample(0, "DORMANT", "WEAK"),
      sample(1, "ACTIVE_NOW", "STRONG"),
      sample(2, "DASHA_ACTIVE_WAITING_TRIGGER", "MODERATE"),
    ],
  });

  if (
    result.window_state !== "ACTIVE_WINDOW" ||
    result.peak_status !== "ACTIVE_NOW" ||
    result.peak_level !== "STRONG" ||
    result.active_now_samples !== 1 ||
    result.dasha_active_samples !== 2 ||
    result.transit_triggered_samples !== 1 ||
    result.dormant_samples !== 1 ||
    result.incomplete_samples !== 0 ||
    result.sample_activation_fraction !== 1 / 3 ||
    result.first_active_at !== result.last_active_at ||
    result.peak_samples.length !== 1 ||
    !result.coverage_complete
  ) {
    throw new Error("active window aggregation changed");
  }

  if (!windowStateSi(result.window_state).includes("දශා")) {
    throw new Error("active Sinhala summary missing");
  }
});

Deno.test("window aggregation distinguishes Dasha, transit, dormant and incomplete windows", () => {
  const cases = [
    {
      state: "DASHA_WINDOW" as const,
      samples: [sample(0, "DASHA_ACTIVE_WAITING_TRIGGER", "MODERATE")],
    },
    {
      state: "TRANSIT_WINDOW" as const,
      samples: [sample(0, "TRANSIT_ONLY", "MODERATE")],
    },
    {
      state: "DORMANT_WINDOW" as const,
      samples: [sample(0, "DORMANT", "WEAK")],
    },
    {
      state: "INCOMPLETE_WINDOW" as const,
      samples: [sample(0, "TIMING_INCOMPLETE", "NONE")],
    },
  ];

  for (const item of cases) {
    const result = aggregatePredictionWindow({
      topic: "CAREER",
      themeCode: "X",
      windowType: "DAILY",
      expectedSamples: 1,
      samples: item.samples,
    });
    if (result.window_state !== item.state || !windowStateSi(item.state)) {
      throw new Error("window state changed: " + item.state);
    }
  }

  const missing = aggregatePredictionWindow({
    topic: "CAREER",
    themeCode: "X",
    windowType: "MONTHLY",
    expectedSamples: 2,
    samples: [sample(0, "ACTIVE_NOW", "STRONG")],
  });
  if (
    missing.window_state !== "INCOMPLETE_WINDOW" ||
    missing.coverage_complete ||
    missing.first_active_at === null ||
    missing.last_active_at === null
  ) {
    throw new Error("partial window was not marked incomplete");
  }
});

Deno.test("window aggregation handles empty observed samples and validates expected count", () => {
  const empty = aggregatePredictionWindow({
    topic: "CAREER",
    themeCode: "X",
    windowType: "YEARLY",
    expectedSamples: 12,
    samples: [],
  });

  if (
    empty.window_state !== "INCOMPLETE_WINDOW" ||
    empty.peak_status !== "TIMING_INCOMPLETE" ||
    empty.peak_level !== "NONE" ||
    empty.first_active_at !== null ||
    empty.last_active_at !== null ||
    empty.peak_samples.length !== 0
  ) {
    throw new Error("empty window semantics changed");
  }

  throws(
    () =>
      aggregatePredictionWindow({
        topic: "CAREER",
        themeCode: "X",
        windowType: "DAILY",
        expectedSamples: 0,
        samples: [],
      }),
    "invalid expected sample count accepted",
  );
});
