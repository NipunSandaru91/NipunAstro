import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { generatePredictionWindow } from "@/app/calculations/actions";
import { createClient } from "@/lib/supabase/server";
import type { PredictionTopic } from "@/lib/prediction/evidence.ts";
import { buildCareerNatalModel } from "@/lib/prediction/topics/career.ts";
import {
  buildGenericTopicNatalModel,
  parsePredictionTopic,
  TOPIC_LABEL_SI,
} from "@/lib/prediction/topics/generic-topic.ts";
import { buildBhavaOverview } from "@/lib/prediction/ui/bhava-overview.ts";
import { buildTransitNatalAnalysis } from "@/lib/prediction/timing/transit-analysis.ts";
import { activateThemesByDasha } from "@/lib/prediction/timing/generic-dasha.ts";
import { activateThemesByTransit } from "@/lib/prediction/timing/generic-transit.ts";
import {
  combineGenericTiming,
  timingStatusSi,
} from "@/lib/prediction/timing/generic-timing.ts";
import {
  buildPredictionWindowPlan,
  localDateInTimezone,
  parsePredictionWindowType,
  utcTimestampToLocalSampleKey,
  type PredictionWindowType,
} from "@/lib/prediction/timing/prediction-window.ts";
import {
  aggregatePredictionWindow,
  windowStateSi,
  type PredictionWindowState,
  type WindowTimingSample,
} from "@/lib/prediction/timing/window-aggregation.ts";

type Search = {
  calculation?: string;
  bhava?: string;
  topic?: string;
  window?: string;
  date?: string;
  window_generated?: string;
  window_error?: string;
  view?: string;
};

type Calculation = {
  id: string;
  subject_name: string | null;
  input_birth_date: string;
  input_birth_time: string;
  input_timezone: string;
  input_place_name: string | null;
  input_country: string | null;
  calculation_timestamp: string;
  status: string;
  node_method: string | null;
};

type ChartData = {
  calculation?: Record<string, unknown>;
  lagna?: Record<string, unknown> | null;
  grahas?: Array<Record<string, unknown>>;
  bhavas?: Array<Record<string, unknown>>;
  shadbala?: Array<Record<string, unknown>>;
};

type DashaRow = {
  id: string;
  graha_id: number;
  start_at: string;
  end_at: string;
  mahadasa_id?: string;
};

type TransitRow = {
  transit_at: string;
  graha_id: number;
  rasi_id: number;
  longitude_sidereal: number;
  degree_in_rasi: number | null;
  is_retrograde: boolean | null;
};

type TopicEvidenceItem = {
  source_bhava: number;
  evidence: ReturnType<typeof buildCareerNatalModel>["primary"][number]["evidence"];
};

type TopicTheme = {
  code: string;
  level: "WEAK" | "MODERATE" | "STRONG";
  text_si: string;
  evidence_refs: string[];
  evidence_grahas: number[];
  evidence_houses: number[];
  supporting: Array<{ code: string; polarity: "SUPPORTING" | "CONTRADICTING"; text_si: string }>;
  contradicting: Array<{ code: string; polarity: "SUPPORTING" | "CONTRADICTING"; text_si: string }>;
};

type NormalizedTopicModel = {
  topic: PredictionTopic;
  primary: TopicEvidenceItem[];
  contextual: TopicEvidenceItem[];
  themes: TopicTheme[];
};

function pick(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
) {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function number(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function containsAt(row: DashaRow, timestamp: string) {
  const at = new Date(timestamp).getTime();
  return (
    new Date(row.start_at).getTime() <= at &&
    at < new Date(row.end_at).getTime()
  );
}

function formatAt(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function evidenceHousesFromRefs(refs: readonly string[]) {
  const houses: number[] = [];
  for (const ref of refs) {
    const match = ref.match(/^(\d+)L-(\d+)H-G\d+$/);
    if (!match) continue;
    houses.push(Number(match[1]), Number(match[2]));
  }
  return [...new Set(houses)];
}

function normalizeTopicModel(
  topic: PredictionTopic,
  model:
    | ReturnType<typeof buildCareerNatalModel>
    | ReturnType<typeof buildGenericTopicNatalModel>,
): NormalizedTopicModel {
  return {
    topic,
    primary: model.primary as TopicEvidenceItem[],
    contextual: model.contextual as TopicEvidenceItem[],
    themes: model.themes.map((theme) => ({
      code: theme.code,
      level: theme.level,
      text_si: theme.text_si,
      evidence_refs: [...theme.evidence_refs],
      evidence_grahas: [...theme.evidence_grahas],
      evidence_houses:
        "evidence_houses" in theme && Array.isArray(theme.evidence_houses)
          ? [...theme.evidence_houses]
          : evidenceHousesFromRefs(theme.evidence_refs),
      supporting: [...theme.supporting],
      contradicting: [...theme.contradicting],
    })),
  };
}

function predictionHref(input: {
  calculation: string;
  bhava: number;
  topic: PredictionTopic;
  window: PredictionWindowType;
  date: string;
  view?: "predictions" | "forecast";
}) {
  const basePath = input.view === "forecast" ? "/forecast" : "/predictions";
  return (
    basePath + "?calculation=" +
    encodeURIComponent(input.calculation) +
    "&bhava=" +
    input.bhava +
    "&topic=" +
    input.topic +
    "&window=" +
    input.window +
    "&date=" +
    encodeURIComponent(input.date)
  );
}

const RASI = [
  "මේෂ",
  "වෘෂභ",
  "මිථුන",
  "කටක",
  "සිංහ",
  "කන්‍යා",
  "තුලා",
  "වෘශ්චික",
  "ධනු",
  "මකර",
  "කුම්භ",
  "මීන",
];

const GRAHA = [
  "",
  "රවි",
  "චන්ද්‍ර",
  "කුජ",
  "බුධ",
  "ගුරු",
  "සිකුරු",
  "ශනි",
  "රාහු",
  "කේතු",
];

const TOPICS: PredictionTopic[] = [
  "CAREER",
  "EDUCATION",
  "RELATIONSHIP",
  "FINANCE",
  "HEALTH",
  "SPIRITUALITY",
];

const WINDOW_LABEL: Record<PredictionWindowType, string> = {
  DAILY: "දෛනික",
  WEEKLY: "සතිපතා",
  MONTHLY: "මාසික",
  YEARLY: "වාර්ෂික",
};

const WINDOW_DETAIL: Record<PredictionWindowType, string> = {
  DAILY:
    "දවස තුළ snapshots 4ක්. චන්ද්‍රයා ඇතුළු සියලු ග්‍රහයන්ගේ short-lived activation පරීක්ෂා කරයි.",
  WEEKLY:
    "දින 7කට දිනපතා snapshot එකක්. චන්ද්‍ර ගමන සහ කෙටි transit triggers අල්ලාගනී.",
  MONTHLY:
    "මාසය පුරා දින දෙකකට වරක් snapshots. රවි, කුජ, බුධ, සිකුරු සහ slow-transit persistence මත අවධානය දෙයි.",
  YEARLY:
    "මාස 12කට monthly snapshots. ගුරු, ශනි, රාහු සහ කේතු සමඟ exact Daśā/Antardaśā changes වෙනම සලකයි.",
};

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("account_type").single();
  if (profile?.account_type === "PERSONAL") redirect("/dashboard");

  const { data: rows } = await supabase
    .from("user_calculation_runs_v1")
    .select("*")
    .order("calculation_timestamp", { ascending: false });

  const calculations = (rows ?? []) as Calculation[];
  const selectedId = calculations.some(
    (calculation) => calculation.id === params.calculation,
  )
    ? params.calculation
    : calculations[0]?.id;
  const selectedBhava = Math.min(12, Math.max(1, Number(params.bhava) || 1));
  const selectedTopic = parsePredictionTopic(params.topic?.toUpperCase());
  const predictionView = params.view === "forecast" ? "forecast" : "predictions";

  if (!selectedId) {
    return (
      <>
        <AppNav active={predictionView === "forecast" ? "forecast" : "predictions"} />
        <main className="astro-shell min-h-screen px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9">
              <p className="eyebrow">Prediction Observatory</p>
              <h1 className="serif mt-3 text-4xl text-[#f3dfb1]">
                පුරෝකථන
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#b9b4a9]">
                පුරෝකථනයක් සඳහා මුලින් සත්‍යාපිත calculation එකක් අවශ්‍යයි.
              </p>
              <Link href="/chart/new" className="cosmic-primary mt-6">
                නව කේන්දරයක් සාදන්න
              </Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  const selectedCalc = calculations.find(
    (calculation) => calculation.id === selectedId,
  )!;
  const windowType = parsePredictionWindowType(params.window?.toUpperCase());
  const todayForChart = localDateInTimezone(
    new Date(),
    selectedCalc.input_timezone,
  );

  let anchorDate = params.date ?? todayForChart;
  let windowPlan;
  try {
    windowPlan = buildPredictionWindowPlan(windowType, anchorDate);
  } catch {
    anchorDate = todayForChart;
    windowPlan = buildPredictionWindowPlan(windowType, anchorDate);
  }

  const nowIso = new Date().toISOString();

  const [
    { data: chartData, error },
    { data: mdData },
    { data: currentTransitData },
    { data: windowTransitData },
  ] = await Promise.all([
    supabase.rpc("get_user_calculation_chart_v1", {
      p_calculation_id: selectedId,
    }),
    supabase
      .schema("jyotisha")
      .from("mahadasa_periods")
      .select("id,graha_id,start_at,end_at")
      .eq("calculation_id", selectedId)
      .order("start_at", { ascending: true }),
    supabase
      .schema("jyotisha")
      .from("transit_positions")
      .select(
        "transit_at,graha_id,rasi_id,longitude_sidereal,degree_in_rasi,is_retrograde",
      )
      .eq("calculation_id", selectedId)
      .lte("transit_at", nowIso)
      .order("transit_at", { ascending: false })
      .limit(18),
    supabase
      .schema("jyotisha")
      .from("transit_positions")
      .select(
        "transit_at,graha_id,rasi_id,longitude_sidereal,degree_in_rasi,is_retrograde",
      )
      .eq("calculation_id", selectedId)
      .gte("transit_at", windowPlan.query_utc_start)
      .lte("transit_at", windowPlan.query_utc_end)
      .order("transit_at", { ascending: true }),
  ]);

  if (error || !chartData) {
    throw new Error(error?.message ?? "PREDICTION_CHART_NOT_AVAILABLE");
  }

  const allMd = (mdData ?? []) as DashaRow[];
  const mdIds = allMd.map((row) => row.id);
  let allAd: DashaRow[] = [];

  if (mdIds.length) {
    const { data: adData } = await supabase
      .schema("jyotisha")
      .from("antardasa_periods")
      .select("id,mahadasa_id,graha_id,start_at,end_at")
      .in("mahadasa_id", mdIds)
      .order("start_at", { ascending: true });
    allAd = (adData ?? []) as DashaRow[];
  }

  const chart = chartData as ChartData;
  const lagna = chart.lagna ?? null;
  const grahas = Array.isArray(chart.grahas) ? chart.grahas : [];
  const bhavaRows = Array.isArray(chart.bhavas) ? chart.bhavas : [];
  const shadbala = Array.isArray(chart.shadbala) ? chart.shadbala : [];
  const lagnaRasiId = number(pick(lagna, "rasi_id"));
  if (!lagnaRasiId) throw new Error("PREDICTION_LAGNA_NOT_AVAILABLE");

  const positions = grahas
    .map((graha) => ({
      graha_id: number(pick(graha, "graha_id")),
      rasi_id: number(pick(graha, "rasi_id")),
    }))
    .filter(
      (row): row is { graha_id: number; rasi_id: number } =>
        Boolean(row.graha_id && row.rasi_id),
    );

  const shad = shadbala
    .map((row) => {
      const graha_id = number(pick(row, "graha_id"));
      const direct = number(pick(row, "total_bala_rupa"));
      const total = number(pick(row, "total_bala"));
      return graha_id
        ? {
            graha_id,
            total_bala_rupa:
              direct ?? (total !== undefined ? total / 60 : 0),
          }
        : null;
    })
    .filter(
      (row): row is { graha_id: number; total_bala_rupa: number } =>
        row !== null,
    );

  let selectedModel: NormalizedTopicModel | null = null;
  try {
    if (selectedTopic === "CAREER") {
      selectedModel = normalizeTopicModel(
        selectedTopic,
        buildCareerNatalModel({
          lagnaRasiId,
          positions,
          shadbala: shad,
        }),
      );
    } else {
      selectedModel = normalizeTopicModel(
        selectedTopic,
        buildGenericTopicNatalModel(selectedTopic, {
          lagnaRasiId,
          positions,
          shadbala: shad,
        }),
      );
    }
  } catch {
    selectedModel = null;
  }

  const natalGrahas = grahas
    .map((graha) => {
      const graha_id = number(pick(graha, "graha_id"));
      const rasi_id = number(pick(graha, "rasi_id"));
      const longitude_sidereal = number(
        pick(graha, "longitude_sidereal", "longitude"),
      );
      return graha_id && rasi_id && longitude_sidereal !== undefined
        ? { graha_id, rasi_id, longitude_sidereal }
        : null;
    })
    .filter(
      (
        row,
      ): row is {
        graha_id: number;
        rasi_id: number;
        longitude_sidereal: number;
      } => row !== null,
    );

  const bhavas = bhavaRows
    .map((bhava) => {
      const bhava_id = number(pick(bhava, "bhava_id", "number"));
      const rasi_id = number(pick(bhava, "rasi_id"));
      const lord_graha_id = number(pick(bhava, "lord_graha_id"));
      return bhava_id && rasi_id && lord_graha_id
        ? { bhava_id, rasi_id, lord_graha_id }
        : null;
    })
    .filter(
      (
        row,
      ): row is {
        bhava_id: number;
        rasi_id: number;
        lord_graha_id: number;
      } => row !== null,
    );

  const timingThemes = (selectedModel?.themes ?? []).map((theme) => ({
    topic: selectedTopic,
    code: theme.code,
    level: theme.level,
    evidence_grahas: theme.evidence_grahas,
    evidence_houses: theme.evidence_houses,
  }));

  const currentMd = allMd.find((row) => containsAt(row, nowIso)) ?? null;
  const currentAd =
    currentMd
      ? allAd.find(
          (row) => row.mahadasa_id === currentMd.id && containsAt(row, nowIso),
        ) ?? null
      : null;

  const currentTransitRows = (currentTransitData ?? []) as TransitRow[];
  const latestTransitAt = currentTransitRows[0]?.transit_at ?? null;
  const latestTransitInputs = latestTransitAt
    ? currentTransitRows
        .filter((row) => row.transit_at === latestTransitAt)
        .map((row) => ({
          graha_id: Number(row.graha_id),
          rasi_id: Number(row.rasi_id),
          longitude_sidereal: Number(row.longitude_sidereal),
          degree_in_rasi:
            row.degree_in_rasi === null
              ? undefined
              : Number(row.degree_in_rasi),
          is_retrograde: Boolean(row.is_retrograde),
          transit_at: row.transit_at,
        }))
    : [];

  const currentTransitAnalysis = latestTransitInputs.length
    ? buildTransitNatalAnalysis({
        lagnaRasiId,
        transits: latestTransitInputs,
        natalGrahas,
        bhavas,
      })
    : [];

  const dashaActivations =
    currentMd && currentAd
      ? activateThemesByDasha({
          themes: timingThemes,
          mahadasaGrahaId: Number(currentMd.graha_id),
          antardasaGrahaId: Number(currentAd.graha_id),
        })
      : [];

  const currentTransitActivations = latestTransitInputs.length
    ? activateThemesByTransit({
        themes: timingThemes,
        transitAnalysis: currentTransitAnalysis,
      })
    : [];

  const timingRows = timingThemes.map((theme) => {
    const dasha = dashaActivations.find(
      (row) => row.theme_code === theme.code,
    );
    const transit = currentTransitActivations.find(
      (row) => row.theme_code === theme.code,
    );
    const timing = combineGenericTiming({
      topic: theme.topic,
      themeCode: theme.code,
      natalLevel: theme.level,
      dasha: dasha
        ? {
            available: true,
            status: dasha.status,
            activation_level: dasha.activation_level,
          }
        : { available: false },
      transit: transit
        ? {
            available: true,
            status: transit.status,
            activation_level: transit.activation_level,
          }
        : { available: false },
    });
    return { theme, dasha, transit, timing };
  });

  const plannedKeys = new Set(
    windowPlan.samples.map((windowSample) => windowSample.key),
  );
  const groupedWindowRows = new Map<string, TransitRow[]>();

  for (const row of (windowTransitData ?? []) as TransitRow[]) {
    const key = utcTimestampToLocalSampleKey(
      row.transit_at,
      selectedCalc.input_timezone,
    );
    if (!plannedKeys.has(key)) continue;
    const existing = groupedWindowRows.get(key) ?? [];
    existing.push(row);
    groupedWindowRows.set(key, existing);
  }

  const windowSamplesByTheme = new Map<string, WindowTimingSample[]>(
    timingThemes.map((theme) => [theme.code, []]),
  );

  for (const windowSample of windowPlan.samples) {
    const snapshotRows = groupedWindowRows.get(windowSample.key) ?? [];
    const uniqueGrahas = new Set(
      snapshotRows.map((row) => Number(row.graha_id)),
    );
    if (uniqueGrahas.size < 9) continue;

    const sampleAt = snapshotRows[0]?.transit_at;
    if (!sampleAt) continue;

    const relevantTransits = snapshotRows
      .filter((row) =>
        windowPlan.transit_graha_ids.includes(Number(row.graha_id)),
      )
      .map((row) => ({
        graha_id: Number(row.graha_id),
        rasi_id: Number(row.rasi_id),
        longitude_sidereal: Number(row.longitude_sidereal),
        degree_in_rasi:
          row.degree_in_rasi === null
            ? undefined
            : Number(row.degree_in_rasi),
        is_retrograde: Boolean(row.is_retrograde),
        transit_at: row.transit_at,
      }));

    const sampleTransitAnalysis = buildTransitNatalAnalysis({
      lagnaRasiId,
      transits: relevantTransits,
      natalGrahas,
      bhavas,
    });

    const sampleMd = allMd.find((row) => containsAt(row, sampleAt)) ?? null;
    const sampleAd =
      sampleMd
        ? allAd.find(
            (row) =>
              row.mahadasa_id === sampleMd.id && containsAt(row, sampleAt),
          ) ?? null
        : null;

    const sampleDashaActivations =
      sampleMd && sampleAd
        ? activateThemesByDasha({
            themes: timingThemes,
            mahadasaGrahaId: Number(sampleMd.graha_id),
            antardasaGrahaId: Number(sampleAd.graha_id),
          })
        : [];

    const sampleTransitActivations = activateThemesByTransit({
      themes: timingThemes,
      transitAnalysis: sampleTransitAnalysis,
    });

    for (const theme of timingThemes) {
      const dasha = sampleDashaActivations.find(
        (row) => row.theme_code === theme.code,
      );
      const transit = sampleTransitActivations.find(
        (row) => row.theme_code === theme.code,
      );
      const timing = combineGenericTiming({
        topic: theme.topic,
        themeCode: theme.code,
        natalLevel: theme.level,
        dasha: dasha
          ? {
              available: true,
              status: dasha.status,
              activation_level: dasha.activation_level,
            }
          : { available: false },
        transit: transit
          ? {
              available: true,
              status: transit.status,
              activation_level: transit.activation_level,
            }
          : { available: false },
      });

      windowSamplesByTheme.get(theme.code)?.push({
        sample_at: sampleAt,
        local_key: windowSample.key,
        status: timing.status,
        level: timing.level,
        transit_trigger_count: transit?.triggers.length ?? 0,
      });
    }
  }

  const windowAggregations = timingThemes.map((theme) =>
    aggregatePredictionWindow({
      topic: theme.topic,
      themeCode: theme.code,
      windowType,
      expectedSamples: windowPlan.samples.length,
      samples: windowSamplesByTheme.get(theme.code) ?? [],
    }),
  );

  const dashaChanges = [
    ...allMd.map((row) => ({
      kind: "Mahādaśā" as const,
      start_at: row.start_at,
      graha_id: row.graha_id,
      mahadasa_id: row.id,
    })),
    ...allAd.map((row) => ({
      kind: "Antardaśā" as const,
      start_at: row.start_at,
      graha_id: row.graha_id,
      mahadasa_id: row.mahadasa_id ?? "",
    })),
  ]
    .filter((change) => {
      const localDate = utcTimestampToLocalSampleKey(
        change.start_at,
        selectedCalc.input_timezone,
      ).slice(0, 10);
      return (
        localDate >= windowPlan.start_date &&
        localDate <= windowPlan.end_date
      );
    })
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    );

  const topicItems = selectedModel
    ? [...selectedModel.primary, ...selectedModel.contextual]
    : [];
  const backedBhavas = [
    ...new Set(
      topicItems.flatMap((item) => [
        item.source_bhava,
        item.evidence.placement.bhava,
      ]),
    ),
  ];
  const overview = buildBhavaOverview({
    lagnaRasiId,
    positions,
    careerEvidenceBhavas: backedBhavas,
  });
  const detail = overview[selectedBhava - 1];
  const evidence = topicItems.filter(
    (item) =>
      item.source_bhava === selectedBhava ||
      item.evidence.placement.bhava === selectedBhava,
  );
  const topicLabel = TOPIC_LABEL_SI[selectedTopic];

  return (
    <>
      <AppNav active="predictions" />
      <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9">
            <p className="eyebrow">
              Prediction Observatory · {selectedTopic} V1
            </p>
            <div className="mt-3 grid gap-7 lg:grid-cols-[1fr_.55fr] lg:items-end">
              <div>
                <h1 className="serif text-4xl text-[#f3dfb1] sm:text-5xl">
                  {topicLabel} · භාව 12 විශ්ලේෂණය
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b4a9]">
                  Natal evidence, Vimśottarī Daśā සහ transit snapshots එකට
                  බැඳී timing state සහ Daily / Weekly / Monthly / Yearly
                  windows පෙන්වයි.
                </p>
              </div>
              <div className="rounded-2xl border border-[#755a2e] bg-[#0b1015]/80 p-4">
                <p className="text-[10px] uppercase tracking-[.15em] text-[#8c8270]">
                  Prediction for
                </p>
                <p className="serif mt-1 text-xl text-[#efd69b]">
                  {selectedCalc.subject_name ??
                    selectedCalc.input_place_name ??
                    "Natal chart"}
                </p>
                <p className="mt-1 text-xs text-[#8d969f]">
                  {selectedCalc.input_birth_date} · {selectedCalc.input_birth_time}
                </p>
                <p className="mt-1 text-[10px] text-[#8d969f]">
                  Topic · {topicLabel}
                </p>
              </div>
            </div>
          </section>

          <section className="astro-card mt-5">
            <p className="eyebrow">Prediction Topic</p>
            <h2 className="serif mt-2 text-2xl text-[#f0e4c8]">
              විශ්ලේෂණ අංශය තෝරන්න
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {TOPICS.map((topic) => (
                <Link
                  key={topic}
                  href={predictionHref({
                    calculation: selectedId,
                    bhava: selectedBhava,
                    topic,
                    window: windowType,
                    date: anchorDate,
                    view: predictionView,
                  })}
                  className={
                    topic === selectedTopic
                      ? "rounded-xl border border-[#b8954f] bg-[#17140e] px-3 py-3 text-center text-xs text-[#e5cc92]"
                      : "rounded-xl border border-[#303944] bg-[#09121a] px-3 py-3 text-center text-xs text-[#89939d]"
                  }
                >
                  {TOPIC_LABEL_SI[topic]}
                </Link>
              ))}
            </div>
            {selectedTopic === "HEALTH" ? (
              <p className="mt-4 rounded-xl border border-[#4a3d27] bg-[#15130e] p-3 text-[11px] leading-6 text-[#a8a091]">
                සුවතාව section එක සාම්ප්‍රදායික ජ්‍යොතිෂ wellbeing pattern
                එකක් පමණයි. රෝග නිර්ණය, වෛද්‍ය අවදානම් අනාවැකි හෝ ප්‍රතිකාර
                උපදෙස් ලෙස භාවිතා නොකරයි.
              </p>
            ) : null}
          </section>

          <section className="astro-card mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Chart Selector</p>
                <h2 className="serif mt-2 text-2xl text-[#f0e4c8]">
                  පුරෝකථනය සඳහා කේන්දරය තෝරන්න
                </h2>
              </div>
              <Link
                href={`/calculations/${selectedId}`}
                className="text-xs text-[#d8b66b]"
              >
                ගණනය බලන්න →
              </Link>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {calculations.map((calculation) => (
                <Link
                  key={calculation.id}
                  href={predictionHref({
                    calculation: calculation.id,
                    bhava: selectedBhava,
                    topic: selectedTopic,
                    window: windowType,
                    date: anchorDate,
                    view: predictionView,
                  })}
                  className={
                    calculation.id === selectedId
                      ? "astro-chip active"
                      : "astro-chip"
                  }
                >
                  <span className="block">
                    {calculation.subject_name ??
                      calculation.input_place_name ??
                      "Natal chart"}
                  </span>
                  <small className="mt-1 block opacity-60">
                    {calculation.input_birth_date}
                  </small>
                </Link>
              ))}
            </div>
          </section>

          {predictionView === "forecast" ? (
          <section className="astro-card mt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Forecast Window Engine V1</p>
                <h2 className="serif mt-2 text-3xl text-[#f0e4c8]">
                  Daily · Weekly · Monthly · Yearly
                </h2>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-[#858f99]">
                  {WINDOW_DETAIL[windowType]}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-[.12em] text-[#67717b]">
                  Selected window
                </p>
                <p className="serif mt-1 text-lg text-[#ddc892]">
                  {windowPlan.label}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const).map(
                (item) => (
                  <Link
                    key={item}
                    href={predictionHref({
                      calculation: selectedId,
                      bhava: selectedBhava,
                      topic: selectedTopic,
                      window: item,
                      date: anchorDate,
                      view: predictionView,
                    })}
                    className={
                      item === windowType
                        ? "rounded-xl border border-[#b8954f] bg-[#17140e] px-2 py-3 text-center text-xs text-[#e5cc92]"
                        : "rounded-xl border border-[#303944] bg-[#09121a] px-2 py-3 text-center text-xs text-[#89939d]"
                    }
                  >
                    {WINDOW_LABEL[item]}
                  </Link>
                ),
              )}
            </div>

            <form
              action={generatePredictionWindow}
              className="mt-5 grid gap-3 rounded-2xl border border-[#303944] bg-[#081017] p-4 md:grid-cols-[1fr_auto]"
            >
              <input type="hidden" name="calculation_id" value={selectedId} />
              <input type="hidden" name="topic" value={selectedTopic} />
              <input
                type="hidden"
                name="timezone"
                value={selectedCalc.input_timezone}
              />
              <input type="hidden" name="window_type" value={windowType} />
              <input type="hidden" name="bhava" value={selectedBhava} />
              <input
                type="hidden"
                name="node_method"
                value={
                  selectedCalc.node_method === "TRUE_NODE" ? "TRUE" : "MEAN"
                }
              />
              <label className="block">
                <span className="text-[10px] uppercase tracking-[.14em] text-[#697787]">
                  Anchor date
                </span>
                <input
                  type="date"
                  name="anchor_date"
                  defaultValue={anchorDate}
                  required
                  className="mt-2 w-full rounded-xl border border-[#34475b] bg-[#0d1014] px-3 py-3 text-sm text-[#eee9de]"
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="cosmic-primary w-full">
                  Generate / Refresh {WINDOW_LABEL[windowType]}
                </button>
              </div>
            </form>

            {params.window_error ? (
              <div className="mt-4 rounded-xl border border-[#5a3434] bg-[#211416] p-4 text-xs leading-6 text-[#d8aaaa]">
                {decodeURIComponent(params.window_error)}
              </div>
            ) : null}

            {params.window_generated ? (
              <div className="mt-4 rounded-xl border border-[#2f4938] bg-[#0d1b16] p-4 text-xs leading-6 text-[#b5d0ba]">
                {windowPlan.samples.length} planned transit snapshots generate
                කර {topicLabel} window aggregation සඳහා සුරකින ලදී.
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {windowAggregations.length ? (
                windowAggregations.map((result) => (
                  <article
                    key={result.theme_code}
                    className="rounded-2xl border border-[#303944] bg-[#09121a] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <WindowBadge state={result.window_state} />
                      <span className="text-[9px] text-[#67717b]">
                        {result.observed_samples}/{result.expected_samples} samples
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[9px] text-[#69727c]">
                      {result.theme_code}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#a8b0b8]">
                      {windowStateSi(result.window_state)}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <MiniMetric
                        label="Convergent"
                        value={String(result.active_now_samples)}
                      />
                      <MiniMetric
                        label="Daśā"
                        value={String(result.dasha_active_samples)}
                      />
                      <MiniMetric
                        label="Transit"
                        value={String(result.transit_triggered_samples)}
                      />
                    </div>
                    {result.first_active_at ? (
                      <p className="mt-3 text-[10px] leading-5 text-[#8c969f]">
                        First convergence ·{" "}
                        {formatAt(
                          result.first_active_at,
                          selectedCalc.input_timezone,
                        )}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#39434e] p-4 text-xs leading-6 text-[#7e8892] md:col-span-3">
                  {topicLabel} V1 theme data නොමැති නිසා window aggregation
                  result නිකුත් කරන්නේ නැහැ.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#303944] bg-[#081017] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Daśā changes inside window</p>
                  <h3 className="serif mt-1 text-xl text-[#eadcbf]">
                    Exact period boundaries
                  </h3>
                </div>
                <span className="text-xs text-[#68717a]">
                  {dashaChanges.length}
                </span>
              </div>
              {dashaChanges.length ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {dashaChanges.slice(0, 12).map((change, index) => {
                    const parent =
                      change.kind === "Antardaśā"
                        ? allMd.find((row) => row.id === change.mahadasa_id)
                        : null;
                    return (
                      <div
                        key={change.kind + change.start_at + index}
                        className="rounded-xl border border-[#29323b] bg-[#091016] p-3"
                      >
                        <p className="text-[9px] uppercase tracking-[.12em] text-[#6d7680]">
                          {change.kind}
                        </p>
                        <p className="mt-1 text-sm text-[#d8cfbf]">
                          {parent
                            ? `${GRAHA[parent.graha_id] ?? parent.graha_id} / `
                            : ""}
                          {GRAHA[change.graha_id] ?? change.graha_id}
                        </p>
                        <p className="mt-1 text-[10px] text-[#818a93]">
                          {formatAt(
                            change.start_at,
                            selectedCalc.input_timezone,
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-6 text-[#737d86]">
                  මෙම කාල කවුළුව තුළ Mahādaśā හෝ Antardaśā boundary change
                  එකක් නොමැත.
                </p>
              )}
            </div>

            <p className="mt-4 text-[10px] leading-5 text-[#68717a]">
              Sample counts probability නොවේ. ඒවා window එක තුළ engine එක
              පරීක්ෂා කළ කාල ලක්ෂ්‍ය පමණි.
            </p>
          </section>
          ) : null}

          {predictionView === "predictions" ? (
          <>
          <section className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">12 Bhāva Overview</p>
                <h2 className="serif mt-2 text-3xl text-[#f0e4c8]">
                  {topicLabel} · භාව 12
                </h2>
              </div>
              <p className="text-[10px] text-[#67717b]">
                {selectedTopic} V1 evidence houses are marked
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {overview.map((row) => {
                const backed = backedBhavas.includes(row.bhava);
                return (
                  <Link
                    key={row.bhava}
                    href={predictionHref({
                      calculation: selectedId,
                      bhava: row.bhava,
                      topic: selectedTopic,
                      window: windowType,
                      date: anchorDate,
                      view: predictionView,
                    })}
                    className={
                      row.bhava === selectedBhava
                        ? "bhava-prediction-card active"
                        : "bhava-prediction-card"
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="bhava-number">{row.bhava}</span>
                      <span
                        className={backed ? "bhava-status ready" : "bhava-status"}
                      >
                        {backed ? "Evidence" : "Foundation"}
                      </span>
                    </div>
                    <h3 className="serif mt-3 text-base text-[#eadcbf]">
                      {row.title_si}
                    </h3>
                    <p className="mt-2 text-[11px] text-[#7f8992]">
                      {RASI[row.rasi_id - 1]} ·{" "}
                      {row.graha_ids.length
                        ? row.graha_ids.map((id) => GRAHA[id]).join(" · ")
                        : "ග්‍රහයන් නැත"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="astro-card mt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Bhāva Detail · {selectedTopic} V1</p>
                <h2 className="serif mt-2 text-3xl text-[#f0e4c8]">
                  භාව {detail.bhava} · {detail.title_si}
                </h2>
                <p className="mt-3 text-sm text-[#9199a2]">
                  {detail.keywords_si.join(" · ")}
                </p>
              </div>
              <span
                className={
                  backedBhavas.includes(detail.bhava)
                    ? "strength-pill"
                    : "bhava-status"
                }
              >
                {backedBhavas.includes(detail.bhava)
                  ? `${selectedTopic} V1 EVIDENCE`
                  : "FOUNDATION ONLY"}
              </span>
            </div>

            {evidence.length ? (
              <div className="mt-6 space-y-4">
                {evidence.map((item) => (
                  <article key={item.evidence.id} className="evidence-chain-card">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <EvidenceBlock
                        label="ග්‍රහයා"
                        value={item.evidence.qualities.graha.name_si}
                        sub={item.evidence.qualities.graha.keywords_si.join(
                          " · ",
                        )}
                      />
                      <EvidenceBlock
                        label="රාශිය"
                        value={item.evidence.qualities.rasi.name_si}
                        sub={
                          item.evidence.qualities.rasi.element_si +
                          " · " +
                          item.evidence.qualities.rasi.keywords_si.join(" · ")
                        }
                      />
                      <EvidenceBlock
                        label="භාවය"
                        value={`භාව ${item.evidence.placement.bhava}`}
                        sub={item.evidence.qualities.bhava.keywords_si.join(
                          " · ",
                        )}
                      />
                    </div>
                    <div className="mt-4 rounded-xl border border-[#2b3540] bg-[#081017] p-4">
                      <p className="text-[10px] uppercase tracking-[.14em] text-[#727b84]">
                        යෙදුණු ජ්‍යොතිෂ නීතිය
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#d7cdbb]">
                        {item.evidence.rule.text_si}
                      </p>
                      <p className="mt-2 font-mono text-[10px] text-[#6d7680]">
                        {item.evidence.rule.code}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Factor
                        title="සහායක සාධක"
                        items={item.evidence.strength.supporting.map(
                          (modifier) => modifier.text_si,
                        )}
                      />
                      <Factor
                        title="විරුද්ධ සාධක"
                        items={item.evidence.strength.contradicting.map(
                          (modifier) => modifier.text_si,
                        )}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#39434e] p-5">
                <p className="text-sm leading-7 text-[#9098a1]">
                  මෙම භාවයට {topicLabel} V1 rule evidence තවම සම්බන්ධ වී නැත.
                  UI එක අසත්‍ය prediction එකක් නිර්මාණය නොකර foundation data
                  පමණක් පෙන්වයි.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="timing-panel">
                <p className="eyebrow">Current Timing Engine V1</p>
                <h3 className="serif mt-2 text-xl text-[#eadcbf]">
                  දශා + ගෝචර
                </h3>
                <div className="mt-3 space-y-2 text-xs leading-6 text-[#828b94]">
                  <p>
                    <span className="text-[#b9a77f]">වත්මන් දශාව:</span>{" "}
                    {currentMd && currentAd
                      ? `${GRAHA[currentMd.graha_id] ?? currentMd.graha_id} / ${GRAHA[currentAd.graha_id] ?? currentAd.graha_id}`
                      : "Timing data incomplete"}
                  </p>
                  <p>
                    <span className="text-[#b9a77f]">
                      Latest past transit snapshot:
                    </span>{" "}
                    {latestTransitAt
                      ? formatAt(latestTransitAt, selectedCalc.input_timezone)
                      : "Snapshot නැත"}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {timingRows.filter((row) =>
                    row.theme.evidence_houses.includes(selectedBhava),
                  ).length ? (
                    timingRows
                      .filter((row) =>
                        row.theme.evidence_houses.includes(selectedBhava),
                      )
                      .map((row) => (
                        <div
                          key={row.theme.code}
                          className="rounded-xl border border-[#2c3640] bg-[#081017] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-[9px] text-[#68717a]">
                              {row.theme.code}
                            </span>
                            <TimingBadge status={row.timing.status} />
                          </div>
                          <p className="mt-2 text-[11px] leading-5 text-[#9da5ad]">
                            {timingStatusSi(row.timing.status)}
                          </p>
                          {row.transit?.triggers.length ? (
                            <p className="mt-1 text-[10px] text-[#6f7983]">
                              Transit evidence · {row.transit.triggers.length}{" "}
                              trigger(s)
                            </p>
                          ) : null}
                        </div>
                      ))
                  ) : (
                    <p className="text-[11px] text-[#68717a]">
                      මෙම භාවයට timing-bound {topicLabel} theme එකක් නොමැත.
                    </p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/calculations/${selectedId}/dasha`}
                    className="cosmic-secondary"
                  >
                    දශා බලන්න
                  </Link>
                  <Link
                    href={`/calculations/${selectedId}/transit`}
                    className="cosmic-secondary"
                  >
                    ගෝචර බලන්න
                  </Link>
                </div>
              </div>

              <div className="timing-panel">
                <p className="eyebrow">Sinhala Conclusion</p>
                <h3 className="serif mt-2 text-xl text-[#eadcbf]">
                  අවසාන නිගමනය
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#828b94]">
                  {evidence.length
                    ? timingRows.some(
                        (row) =>
                          row.theme.evidence_houses.includes(selectedBhava) &&
                          row.timing.status === "ACTIVE_NOW",
                      )
                      ? `${topicLabel} natal evidence සමඟ වත්මන් දශා සහ ගෝචර timing සාධක එකවර සක්‍රීය වන theme එකක් මෙම භාවයට සම්බන්ධ වේ.`
                      : `${topicLabel} natal evidence ඇත. වත්මන් timing state එක evidence සමඟ වෙනම පෙන්වා ඇති අතර data නොමැති තැන නිගමනයක් නිර්මාණය නොකරයි.`
                    : `මෙම භාවයට ${topicLabel} V1 සම්පූර්ණ prediction model evidence එක තවම නොමැත.`}
                </p>
              </div>
            </div>
          </section>

          {selectedModel?.themes.length ? (
            <section className="astro-card mt-5">
              <p className="eyebrow">
                {selectedTopic} V1 Themes · Generic Timing Adapter
              </p>
              <h2 className="serif mt-2 text-2xl text-[#f0e4c8]">
                {topicLabel} තේමා සහ timing state
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {selectedModel.themes.map((theme) => {
                  const row = timingRows.find(
                    (item) => item.theme.code === theme.code,
                  );
                  const windowResult = windowAggregations.find(
                    (item) => item.theme_code === theme.code,
                  );
                  return (
                    <div
                      key={theme.code}
                      className="rounded-2xl border border-[#303944] bg-[#081017] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="strength-pill">{theme.level}</span>
                        <div className="flex gap-1">
                          {row ? <TimingBadge status={row.timing.status} /> : null}
                          {windowResult ? (
                            <WindowBadge state={windowResult.window_state} />
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#d2c8b6]">
                        {theme.text_si}
                      </p>
                      {row ? (
                        <p className="mt-2 text-[11px] leading-5 text-[#89939d]">
                          {timingStatusSi(row.timing.status)}
                        </p>
                      ) : null}
                      <p className="mt-2 font-mono text-[9px] text-[#66707a]">
                        {theme.code}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
          </>
          ) : null}

          <p className="mt-6 text-center text-[10px] leading-5 text-[#66707a]">
            Prediction strength සහ sample counts සැබෑ ජීවිත probability
            ප්‍රතිශත නොවේ. ඒවා rule-system evidence සහ sampled timing states
            පමණි.
          </p>
        </div>
      </main>
    </>
  );
}

function EvidenceBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-[#2c3640] bg-[#081017] p-4">
      <p className="text-[9px] uppercase tracking-[.14em] text-[#6d7680]">
        {label}
      </p>
      <p className="serif mt-1 text-lg text-[#e8d8b7]">{value}</p>
      <p className="mt-2 text-[11px] leading-5 text-[#818a93]">{sub}</p>
    </div>
  );
}

function Factor({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#2c3640] bg-[#081017] p-4">
      <p className="text-[10px] text-[#cba85d]">{title}</p>
      <div className="mt-2 space-y-1">
        {items.length ? (
          items.map((item, index) => (
            <p key={index} className="text-[11px] leading-5 text-[#929aa3]">
              • {item}
            </p>
          ))
        ) : (
          <p className="text-[11px] text-[#68717a]">වාර්තා වී නැත</p>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#29323b] bg-[#081017] p-2">
      <p className="text-[8px] uppercase tracking-[.1em] text-[#65707a]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#d5c8ad]">{value}</p>
    </div>
  );
}

function TimingBadge({
  status,
}: {
  status:
    | "ACTIVE_NOW"
    | "DASHA_ACTIVE_WAITING_TRIGGER"
    | "TRANSIT_ONLY"
    | "DORMANT"
    | "TIMING_INCOMPLETE";
}) {
  const label =
    status === "ACTIVE_NOW"
      ? "ACTIVE NOW"
      : status === "DASHA_ACTIVE_WAITING_TRIGGER"
        ? "DASHA ACTIVE"
        : status === "TRANSIT_ONLY"
          ? "TRANSIT ONLY"
          : status === "DORMANT"
            ? "DORMANT"
            : "INCOMPLETE";
  const cls =
    status === "ACTIVE_NOW"
      ? "border-[#8f7740] text-[#d8b66b]"
      : status === "TIMING_INCOMPLETE"
        ? "border-[#5a3434] text-[#c98f8f]"
        : "border-[#34475b] text-[#8fa3b5]";
  return (
    <span className={"rounded-full border px-2 py-1 text-[9px] " + cls}>
      {label}
    </span>
  );
}

function WindowBadge({ state }: { state: PredictionWindowState }) {
  const label: Record<PredictionWindowState, string> = {
    ACTIVE_WINDOW: "ACTIVE WINDOW",
    DASHA_WINDOW: "DASHA WINDOW",
    TRANSIT_WINDOW: "TRANSIT WINDOW",
    DORMANT_WINDOW: "DORMANT",
    INCOMPLETE_WINDOW: "INCOMPLETE",
  };
  const cls =
    state === "ACTIVE_WINDOW"
      ? "border-[#8f7740] text-[#d8b66b]"
      : state === "INCOMPLETE_WINDOW"
        ? "border-[#5a3434] text-[#c98f8f]"
        : "border-[#34475b] text-[#8fa3b5]";
  return (
    <span className={"rounded-full border px-2 py-1 text-[9px] " + cls}>
      {label[state]}
    </span>
  );
}
