import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import D1Chart from "@/app/components/d1-chart";
import AppNav from "@/app/components/app-nav";
import ChartNameEditor from "@/app/components/chart-name-editor";
import DeleteChartButton from "@/app/components/delete-chart-button";
import PersonalChartView from "@/app/components/personal-chart-view";
import { buildCareerNatalModel } from "@/lib/prediction/topics/career.ts";
import { buildGenericTopicNatalModel, TOPIC_LABEL_SI } from "@/lib/prediction/topics/generic-topic.ts";
import type { PredictionTopic } from "@/lib/prediction/evidence.ts";
import { SUBJECT_RELATIONSHIPS } from "@/lib/calculations/subject-relationship";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

type ChartData = {
  calculation?: Record<string, unknown>;
  lagna?: Record<string, unknown> | null;
  grahas?: Array<Record<string, unknown>>;
  shadbala?: Array<Record<string, unknown>>;
};

function textValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

const RASHI_SI = [
  "මේෂ", "වෘෂභ", "මිථුන", "කටක", "සිංහ", "කන්‍යා",
  "තුලා", "වෘශ්චික", "ධනු", "මකර", "කුම්භ", "මීන",
];

const NAKSHATRA_SI = [
  "අශ්විනී", "භරණී", "කෘත්තිකා", "රෝහිණී", "මෘගශීර්ෂ", "ආර්ද්‍රා",
  "පුනර්වසූ", "පුෂ්‍ය", "ආශ්ලේෂා", "මාඝා", "පූර්වඵල්ගුණී", "උත්තරඵල්ගුණී",
  "හස්ත", "චිත්‍රා", "ස්වාතී", "විශාඛා", "අනුරාධා", "ජ්‍යේෂ්ඨා",
  "මූල", "පූර්වාෂාඪා", "උත්තරාෂාඪා", "ශ්‍රවණ", "ධනිෂ්ඨා", "ශතභිෂා",
  "පූර්වභාද්‍රපදා", "උත්තරභාද්‍රපදා", "රේවතී",
];

const GRAHA_SI: Record<string, string> = {
  SURYA: "රවි",
  CHANDRA: "චන්ද්‍ර",
  MANGALA: "කුජ",
  BUDHA: "බුධ",
  GURU: "ගුරු",
  SHUKRA: "ශුක්‍ර",
  SHANI: "ශනි",
  RAHU: "රාහු",
  KETU: "කේතු",
};

function rashiSinhala(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 && id <= 12 ? RASHI_SI[id - 1] : undefined;
}

function nakshatraSinhala(longitude: unknown) {
  const lon = Number(longitude);
  if (!Number.isFinite(lon)) return undefined;
  const index = Math.floor((((lon % 360) + 360) % 360) / (360 / 27));
  return NAKSHATRA_SI[index];
}

function grahaSinhala(obj: Record<string, unknown>) {
  const code = String(pick(obj, "code", "graha_code") ?? "").toUpperCase();
  return GRAHA_SI[code] ?? pick(obj, "sinhala_name", "iast_name", "english_name", "name", "code");
}

function pick(obj: Record<string, unknown> | null | undefined, ...keys: string[]) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return undefined;
}

export default async function CalculationPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error: engineError, saved } = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_user_calculation_chart_v1",
    { p_calculation_id: id },
  );

  if (error?.code === "42501" || !data) {
    notFound();
  }

  if (error) {
    throw new Error(error.message);
  }

  const [{ data: yogaData }, { data: runMeta }, { data: profile }] = await Promise.all([
    supabase.rpc(
      "get_user_calculation_yoga_v1",
      { p_calculation_id: id },
    ),
    supabase
      .from("user_calculation_runs_v1")
      .select("subject_name,subject_relationship,input_timezone")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profiles").select("account_type").single(),
  ]);

  const chart = {
    ...(data as ChartData),
    yoga_evaluations: Array.isArray(yogaData) ? yogaData : [],
  } as ChartData & { yoga_evaluations: Array<Record<string, unknown>> };
  const calculation = chart.calculation ?? {};
  const lagna = chart.lagna ?? null;
  const grahas = Array.isArray(chart.grahas) ? chart.grahas : [];
  const shadbala = Array.isArray(chart.shadbala) ? chart.shadbala : [];
  const lagnaRasiId = Number(pick(lagna, "rasi_id"));

  if (profile?.account_type === "PERSONAL") {
    const positions = grahas
      .map((graha) => ({ graha_id: Number(pick(graha, "graha_id")), rasi_id: Number(pick(graha, "rasi_id")) }))
      .filter((row): row is { graha_id: number; rasi_id: number } => Boolean(row.graha_id && row.rasi_id));
    const shad = shadbala.map((row) => {
      const graha_id = Number(pick(row, "graha_id"));
      const direct = Number(pick(row, "total_bala_rupa"));
      const total = Number(pick(row, "total_bala"));
      return graha_id ? { graha_id, total_bala_rupa: Number.isFinite(direct) ? direct : Number.isFinite(total) ? total / 60 : 0 } : null;
    }).filter((row): row is { graha_id: number; total_bala_rupa: number } => row !== null);

    const topicIds: PredictionTopic[] = ["CAREER", "EDUCATION", "RELATIONSHIP", "FINANCE", "HEALTH", "SPIRITUALITY"];
    const natalModels = topicIds.map((topic) => topic === "CAREER"
      ? buildCareerNatalModel({ lagnaRasiId, positions, shadbala: shad })
      : buildGenericTopicNatalModel(topic, { lagnaRasiId, positions, shadbala: shad }));
    const { data: mdRows } = await supabase
      .schema("jyotisha").from("mahadasa_periods").select("id,graha_id,start_at,end_at")
      .eq("calculation_id", id).order("start_at", { ascending: true });
    const md = mdRows ?? [];
    const { data: adRows } = md.length
      ? await supabase.schema("jyotisha").from("antardasa_periods").select("id,mahadasa_id,graha_id,start_at,end_at").in("mahadasa_id", md.map((row) => row.id)).order("start_at", { ascending: true })
      : { data: [] as Array<{ id: string; mahadasa_id: string; graha_id: number; start_at: string; end_at: string }> };
    // This is a server rendered, time-sensitive reading; the active period must use request time.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const pairs = (adRows ?? []).map((ad) => {
      const maha = md.find((row) => row.id === ad.mahadasa_id);
      return maha ? { maha: Number(maha.graha_id), antar: Number(ad.graha_id), start: String(ad.start_at), end: String(ad.end_at) } : null;
    }).filter((row): row is { maha: number; antar: number; start: string; end: string } => row !== null).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    const activePair = pairs.find((pair) => Date.parse(pair.start) <= now && Date.parse(pair.end) > now) ?? null;
    const upcomingPair = pairs.find((pair) => Date.parse(pair.start) > now) ?? null;
    const grahaLabels: Record<number, string> = { 1: "රවි", 2: "චන්ද්‍ර", 3: "කුජ", 4: "බුධ", 5: "ගුරු", 6: "ශුක්‍ර", 7: "ශනි", 8: "රාහු", 9: "කේතු" };
    const topics = natalModels.map((model) => {
      const themes = model.themes;
      const level = themes.some((theme) => theme.level === "STRONG") ? "STRONG" : themes.some((theme) => theme.level === "MODERATE") ? "MODERATE" : "WEAK";
      const activation = (pair: typeof activePair) => {
        if (!pair) return null;
        const matches = new Set(themes.flatMap((theme) => theme.evidence_grahas).filter((id) => id === pair.maha || id === pair.antar));
        return { maha: grahaLabels[pair.maha] ?? "ග්‍රහයා", antar: grahaLabels[pair.antar] ?? "ග්‍රහයා", start: pair.start, end: pair.end, activation: matches.size >= 2 ? "STRONG" as const : matches.size === 1 ? "MODERATE" as const : "NONE" as const };
      };
      const displayLabel = TOPIC_LABEL_SI[model.topic];
      return { id: model.topic, label: displayLabel, natalLevel: level, current: activation(activePair), next: activation(upcomingPair) };
    });
    // Use the narrative catalog in the personal view, while keeping all chart evidence server-side.
    return (
      <PersonalChartView
        calculationId={id}
        subjectName={runMeta?.subject_name ?? null}
        relationshipLabel={SUBJECT_RELATIONSHIPS.find((item) => item.value === runMeta?.subject_relationship)?.label ?? null}
        topics={topics as Parameters<typeof PersonalChartView>[0]["topics"]}
        timezone={runMeta?.input_timezone ?? "UTC"}
        saved={saved}
      />
    );
  }

  return (
    <>
      <AppNav />
      <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#d7e5da] pb-7">
          <p className="eyebrow">N Astro · ගණනය කිරීමේ වාර්තාව</p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="serif text-4xl tracking-tight text-[#18372a]">
                {runMeta?.subject_name ?? "උපන් කේන්දරය"}
              </h1>
              <ChartNameEditor calculationId={id} initialName={runMeta?.subject_name ?? ""} />
              {saved ? <p className="mt-2 text-xs text-[#176b4a]">නම යාවත්කාලීන කර ඇත.</p> : null}
              <p className="mt-3 text-sm text-[var(--muted)]">
                Verified calculation output. Interpretation is deliberately
                separated from the astronomical calculation layer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/my-chart"
                className="rounded-lg border border-[#d7e5da] px-3 py-2 text-xs text-[#566c5e] transition hover:border-[#b9d8c3] hover:text-[#18372a]"
              >
                මගේ කේන්දර
              </a>
              <DeleteChartButton calculationId={id} label="කේන්දරය මකන්න" />
            </div>
          </div>
        </header>

        {engineError ? (
          <section className="mt-7 rounded-2xl border border-[#e9c5c0] bg-[#fff4f2] p-6">
            <p className="eyebrow">එන්ජින් තත්ත්වය</p>
            <p className="mt-2 text-sm leading-7 text-[#8b3c35]">
              {decodeURIComponent(engineError)}
            </p>
          </section>
        ) : null}

        {!engineError ? (
        <section className="mt-7 rounded-3xl border border-[#b9d8c3] bg-[#e8f4ec] p-5 shadow-2xl sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#b9d8c3] bg-[#ffffff]">
              <span className="text-2xl text-[#176b4a]">✓</span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#566c5e]">
                8 / 8 · Chart Ready
              </p>
              <h2 className="serif mt-1 text-2xl text-[#18372a]">
                Chart calculated successfully
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#566c5e]">
                Your verified calculation is ready to explore. The values below
                come directly from the calculation layer.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">
                Lagna · D1
              </p>
              <p className="serif mt-1 text-2xl text-[#176b4a]">
                {textValue(
                  rashiSinhala(pick(lagna, "rasi_id")) ??
                    pick(lagna, "rashi", "sign", "name", "code"),
                )}
              </p>
              <p className="mt-1 text-xs text-[#566c5e]">
                {textValue(pick(lagna, "degree_in_rasi", "degree", "longitude_in_rasi"))}°
              </p>
            </div>

            <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">
                Nakṣatra
              </p>
              <p className="serif mt-1 text-2xl text-[#18372a]">
                {textValue(
                  nakshatraSinhala(pick(lagna, "longitude_sidereal", "longitude")) ??
                    pick(lagna, "nakshatra", "nakshatra_name"),
                )}
              </p>
              <p className="mt-1 text-xs text-[#566c5e]">
                Pada {textValue(pick(lagna, "pada"))}
              </p>
            </div>
          </div>

          <a
            href="#chart-details"
            className="mt-4 block w-full rounded-2xl border border-[#b9d8c3] bg-[#176b4a] px-4 py-3.5 text-center text-sm font-semibold text-[#ffffff] transition hover:brightness-110"
          >
            View Chart
          </a>
        </section>

        ) : null}

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel rounded-2xl p-7">
            <p className="eyebrow">ගණනය කිරීම</p>
            <h2 className="serif mt-2 text-2xl text-[#18372a]">
              ආදානය සහ සම්මතය
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DataItem label="කේන්දර හිමියා" value={runMeta?.subject_name ?? "—"} />
              <DataItem label="ගණනය කිරීමේ ID" value={id} />
              <DataItem label="තත්ත්වය" value={textValue(pick(calculation, "status"))} />
              <DataItem label="උපන් දිනය" value={textValue(pick(calculation, "input_birth_date", "birth_date"))} />
              <DataItem label="උපන් වේලාව" value={textValue(pick(calculation, "input_birth_time", "birth_time"))} />
              <DataItem label="වේලා කලාපය" value={textValue(pick(calculation, "input_timezone", "timezone"))} />
              <DataItem label="ස්ථානය" value={textValue(pick(calculation, "input_place_name", "place_name"))} />
              <DataItem label="රට" value={textValue(pick(calculation, "input_country", "country"))} />
              <DataItem label="අයනාංශය" value={textValue(pick(calculation, "ayanamsa"))} />
              <DataItem label="රාශි චක්‍රය" value={textValue(pick(calculation, "zodiac_type", "zodiac"))} />
              <DataItem label="භාව ක්‍රමය" value={textValue(pick(calculation, "house_system"))} />
              <DataItem label="නෝඩ් ක්‍රමය" value={textValue(pick(calculation, "node_method"))} />
              <DataItem label="එන්ජිම" value={textValue(pick(calculation, "engine_version", "engine"))} />
            </div>
          </div>

          <div className="panel rounded-2xl p-7">
            <p className="eyebrow">ලග්නය · D1 Ascendant</p>

            <div className="mt-4 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-5">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[var(--gold)] bg-[#ffffff]">
                  <span className="serif text-2xl text-[var(--gold)]">
                    {textValue(rashiSinhala(pick(lagna, "rasi_id")) ?? pick(lagna, "rashi", "sign", "name", "code"))}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#566c5e]">
                    Sidereal Lagna
                  </p>
                  <h2 className="serif mt-1 text-3xl text-[#18372a]">
                    {textValue(rashiSinhala(pick(lagna, "rasi_id")) ?? pick(lagna, "rashi", "sign", "name", "code"))}
                  </h2>
                  <p className="mt-1 text-xs text-[#566c5e]">
                    {textValue(pick(lagna, "degree_in_rasi", "degree", "longitude_in_rasi"))}°
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <DataItem
                  label="රාශිය"
                  value={textValue(pick(lagna, "rasi_id"))}
                />
                <DataItem
                  label="නැකත"
                  value={textValue(
                    nakshatraSinhala(pick(lagna, "longitude_sidereal", "longitude")) ??
                      pick(lagna, "nakshatra", "nakshatra_name"),
                  )}
                />
                <DataItem label="පාදය" value={textValue(pick(lagna, "pada"))} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#566c5e]">
                Sidereal longitude
              </p>
              <p className="mt-2 font-mono text-sm text-[#18372a]">
                {textValue(pick(lagna, "longitude_sidereal", "longitude"))}°
              </p>
              <p className="mt-2 text-xs leading-5 text-[#566c5e]">
                Lahiri ayanāṃśa · Whole Sign · Calculation layer only
              </p>
            </div>
          </div>
        </section>

        <section className="panel mt-5 rounded-3xl p-4 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Chart Overview</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">
                D1 · Rāśi
              </h2>
            </div>
            <span className="text-[10px] text-[#566c5e]">Screen 10 · Bhāva</span>
          </div>

          <nav className="mt-5 grid grid-cols-4 overflow-hidden rounded-xl border border-[#d7e5da] bg-[#ffffff]" aria-label="Chart sections">
            <a href="#d1-chart" className="border-b-2 border-[#b9d8c3] bg-[#ffffff] px-2 py-3 text-center text-[10px] font-semibold text-[#18372a]">D1</a>
            <a href="#bhava" className="px-2 py-3 text-center text-[10px] text-[#566c5e]">භාව</a>
            <a href="#drishti" className="px-2 py-3 text-center text-[10px] text-[#566c5e]">Dṛṣṭi</a>
            <a href="#shadbala" className="px-2 py-3 text-center text-[10px] text-[#566c5e]">Ṣaḍbala</a>
          </nav>

          <div id="d1-chart" className="mt-5">
            <D1Chart
              lagnaRasiId={lagnaRasiId}
              grahas={grahas}
              rashiNames={RASHI_SI}
              grahaNames={GRAHA_SI}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">Lagna</p>
              <p className="serif mt-1 text-lg text-[#176b4a]">{textValue(rashiSinhala(lagnaRasiId))}</p>
            </div>
            <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">Grahas</p>
              <p className="serif mt-1 text-lg text-[#18372a]">{grahas.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">System</p>
              <p className="mt-1 text-xs text-[#18372a]">Lahiri · Whole Sign</p>
            </div>
          </div>
        </section>

        
        <section id="bhava" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · භාව</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">භාව 12</h2>
            </div>
            <p className="text-xs text-[#566c5e]">Whole Sign · Lagna-based</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }, (_, index) => {
              const house = index + 1;
              const rashiId = ((lagnaRasiId - 1 + index) % 12) + 1;
              const planets = grahas.filter(
                (graha) => Number(pick(graha, "rasi_id")) === rashiId,
              );

              return (
                <article
                  key={house}
                  className={house === 1 ? "rounded-2xl border border-[#b9d8c3] bg-[#ffffff] p-4" : "rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">
                        භාව {house}
                      </p>
                      <h3 className="serif mt-1 text-lg text-[#18372a]">
                        {house === 1 ? "ලග්න භාවය" : "භාව " + house}
                      </h3>
                    </div>
                    {house === 1 ? (
                      <span className="rounded-full border border-[#b9d8c3] px-2 py-1 text-[9px] text-[#176b4a]">
                        ලග්නය
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 border-t border-[#d7e5da] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#566c5e]">රාශිය</p>
                    <p className="mt-1 text-sm text-[#18372a]">{rashiSinhala(rashiId) ?? "—"}</p>
                    <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-[#566c5e]">ග්‍රහයන්</p>
                    <p className="mt-1 text-sm leading-6 text-[#18372a]">
                      {planets.length ? planets.map((planet) => String(grahaSinhala(planet))).join(" · ") : "ග්‍රහයන් නොමැත"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-6 text-[#566c5e]">
            භාව mapping එක Lagna Rāśi මත පදනම් වූ Whole Sign calculation එකෙන් ලබා ගනී.
            භාවාධිපති වැනි interpretation-layer data මෙහි නොගොඩනගයි.
          </p>
        </section>


        <section id="drishti" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · දෘෂ්ටි</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">ග්‍රහ දෘෂ්ටි</h2>
            </div>
            <p className="text-xs text-[#566c5e]">Graha Dṛṣṭi · Calculation view</p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
            <p className="text-xs leading-6 text-[#566c5e]">
              මෙහි පෙන්වන්නේ D1 රාශි පිහිටීම් මත ගණනය කළ සාම්ප්‍රදායික Graha Dṛṣṭi mapping එකයි.
              සියලුම ග්‍රහයන්ට 7 වන දෘෂ්ටියද, කුජට 4/8, ගුරුට 5/9, ශනිට 3/10 අමතර දෘෂ්ටිද ගණනය කරයි.
              රාහු/කේතු සඳහා විකල්ප දෘෂ්ටි පද්ධති මෙහි ඇතුළත් නොකරයි.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grahas.map((graha, index) => {
              const rashiId = Number(pick(graha, "rasi_id"));
              const code = String(pick(graha, "code", "graha_code") ?? "").toUpperCase();
              const offsets = code === "MANGALA"
                ? [4, 7, 8]
                : code === "GURU"
                  ? [5, 7, 9]
                  : code === "SHANI"
                    ? [3, 7, 10]
                    : [7];
              const targets = offsets.map((offset) => {
                const targetRasiId = ((rashiId - 1 + offset - 1) % 12) + 1;
                const targetBhava =
                  Number.isInteger(lagnaRasiId) && Number.isInteger(targetRasiId)
                    ? ((targetRasiId - lagnaRasiId + 12) % 12) + 1
                    : undefined;
                return { offset, targetRasiId, targetBhava };
              });

              return (
                <article
                  key={textValue(pick(graha, "code", "graha_code", "name"), String(index))}
                  className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">ග්‍රහයා</p>
                      <h3 className="serif mt-1 text-lg text-[#18372a]">{textValue(grahaSinhala(graha))}</h3>
                    </div>
                    <span className="rounded-full border border-[#d7e5da] px-2 py-1 text-[9px] text-[#566c5e]">
                      {rashiSinhala(rashiId) ?? "—"}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-[#d7e5da] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#566c5e]">දෘෂ්ටි කරන ස්ථාන</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {targets.map(({ offset, targetRasiId, targetBhava }) => (
                        <span
                          key={offset}
                          className="rounded-xl border border-[#d7e5da] bg-[#ffffff] px-3 py-2 text-xs text-[#18372a]"
                        >
                          {offset} වන දෘෂ්ටිය · {rashiSinhala(targetRasiId) ?? "—"}
                          {targetBhava ? " · භාව " + targetBhava : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

<section id="chart-details" className="panel mt-5 rounded-2xl p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · ග්‍රහ පිහිටීම්</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">
                නිරයණ ග්‍රහ පිහිටීම්
              </h2>
            </div>
            <p className="text-xs text-[#566c5e]">{grahas.length} ග්‍රහ වාර්තා</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#d7e5da] text-[10px] uppercase tracking-[0.14em] text-[#566c5e]">
                <tr>
                  <th className="px-3 py-3 font-medium">භාවය</th>
                  <th className="px-3 py-3 font-medium">ග්‍රහයා</th>
                  <th className="px-3 py-3 font-medium">රාශිය</th>
                  <th className="px-3 py-3 font-medium">අංශක</th>
                  <th className="px-3 py-3 font-medium">නැකත</th>
                  <th className="px-3 py-3 font-medium">පාදය</th>
                  <th className="px-3 py-3 font-medium">වක්‍ර</th>
                </tr>
              </thead>
              <tbody>
                {grahas.map((graha, index) => {
                  const grahaRasiId = Number(pick(graha, "rasi_id"));
                  const bhava =
                    Number.isInteger(grahaRasiId) && Number.isInteger(lagnaRasiId)
                      ? ((grahaRasiId - lagnaRasiId + 12) % 12) + 1
                      : undefined;

                  return (
                    <tr
                      key={textValue(
                        pick(graha, "code", "graha_code", "name"),
                        String(index),
                      )}
                      className="border-b border-[#d7e5da] last:border-0"
                    >
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(bhava)}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(grahaSinhala(graha))}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(
                          rashiSinhala(pick(graha, "rasi_id")) ??
                            pick(graha, "rashi", "sign", "sign_name"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(
                          pick(graha, "degree_in_rasi", "degree", "longitude_in_rasi"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(
                          nakshatraSinhala(
                            pick(graha, "longitude_sidereal", "longitude"),
                          ) ?? pick(graha, "nakshatra", "nakshatra_name"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(pick(graha, "pada"))}
                      </td>
                      <td className="px-3 py-4 text-[#18372a]">
                        {textValue(pick(graha, "is_retrograde", "retrograde"), "false")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="shadbala" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Screen 12 · Ṣaḍbala</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">ෂඩ්බලය · ග්‍රහ බල</h2>
            </div>
            <p className="text-xs text-[#566c5e]">Actual calculation output · Virupa</p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
            <p className="text-xs leading-6 text-[#566c5e]">
              මෙහි අගයන් දැනට පවතින Ṣaḍbala / Kala Bala calculation output එකෙන්
              සෘජුව ලබා ගනී. UI එක interpretation හෝ strength ranking එකක් නොකරයි.
            </p>
          </div>

          {shadbala.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {shadbala.map((row, index) => {
                const graha = grahas.find(
                  (item) => Number(pick(item, "graha_id")) === Number(pick(row, "graha_id")),
                );
                const name = textValue(graha ? grahaSinhala(graha) : pick(row, "graha_id"));
                const total = Number(pick(row, "total_bala"));
                const rupa = Number.isFinite(total) ? total / 60 : undefined;

                const items = [
                  ["ස්ථාන බල", "sthana_bala"],
                  ["දිග් බල", "dig_bala"],
                  ["කාල බල", "kala_bala"],
                  ["චේෂ්ටා බල", "cheshta_bala"],
                  ["නෛසර්ගික බල", "naisargika_bala"],
                  ["දෘක් බල", "drik_bala"],
                ] as const;

                return (
                  <article
                    key={String(pick(row, "graha_id") ?? index)}
                    className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">
                          ග්‍රහයා
                        </p>
                        <h3 className="serif mt-1 text-xl text-[#18372a]">{name}</h3>
                      </div>

                      <div className="rounded-xl border border-[#b9d8c3] bg-[#ffffff] px-3 py-2 text-right">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[#566c5e]">
                          මුළු බල
                        </p>
                        <p className="font-mono text-sm text-[#176b4a]">
                          {textValue(pick(row, "total_bala"))}
                        </p>
                        {rupa !== undefined ? (
                          <p className="mt-0.5 text-[9px] text-[#566c5e]">
                            {rupa.toFixed(2)} Rupa
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {items.map(([label, key]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-[#d7e5da] bg-[#ffffff] p-3"
                        >
                          <p className="text-[9px] leading-4 text-[#566c5e]">{label}</p>
                          <p className="mt-1 font-mono text-xs text-[#18372a]">
                            {textValue(pick(row, key))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-5">
              <p className="text-sm text-[#18372a]">ෂඩ්බල දත්ත මෙම calculation record එකේ නොමැත.</p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-[#d7e5da] bg-[#ffffff] p-4">
            <p className="text-xs leading-6 text-[#566c5e]">
              ගණනය කිරීමේ මූලික ඒකකය Virupa වේ. 60 Virupa = 1 Rupa.
              දෘක් බලයට සෘණ අගයක් ලැබිය හැක. මෙහි Rupa අගය total_bala / 60 ලෙස
              presentation සඳහා පමණක් පෙන්වයි.
            </p>
          </div>
        </section>


        <section id="yoga" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Screen 13 · Yoga</p>
              <h2 className="serif mt-2 text-2xl text-[#18372a]">යෝග · Yoga</h2>
            </div>
            <p className="text-xs text-[#566c5e]">Yoga Engine V1 · Calculation layer</p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4">
            <p className="text-xs leading-6 text-[#566c5e]">
              මෙහි Yoga formation status එක calculation engine එකෙන් ලැබෙන rule evaluation
              මත පෙන්වයි. “Formed” යන්න rule conditions සපුරා ඇති බව පමණක් දක්වන අතර
              එයින් फलादेशයක් හෝ පුද්ගල ජීවිත ප්‍රතිඵලයක් අදහස් නොකරයි.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["RUCHAKA", "රුචක යෝගය"],
              ["BHADRA", "භද්‍ර යෝගය"],
              ["HAMSA", "හංස යෝගය"],
              ["MALAVYA", "මාලව්‍ය යෝගය"],
              ["SASA", "ශශ යෝගය"],
              ["GAJA_KESARI", "ගජකේසරී යෝගය"],
              ["KEMADRUMA", "කේමද්‍රුම යෝගය"],
              ["VIPARITA_HARSA", "විපරීත හර්ෂ යෝගය"],
              ["VIPARITA_SARALA", "විපරීත සරල යෝගය"],
              ["VIPARITA_VIMALA", "විපරීත විමල යෝගය"],
            ].map(([code, name]) => {
              const yogaRules = (chart as ChartData & { yoga_evaluations?: Array<Record<string, unknown>> }).yoga_evaluations ?? [];
              const evaluation = yogaRules.find(
                (row) => String(pick(row, "rule_code", "code")) === code,
              );
              const formed = String(pick(evaluation, "formation_status", "status") ?? "").toUpperCase() === "TRUE"
                || String(pick(evaluation, "formation_status", "status") ?? "").toUpperCase() === "FORMED";
              return (
                <article
                  key={code}
                  className={formed
                    ? "rounded-2xl border border-[#b9d8c3] bg-[#ffffff] p-4"
                    : "rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#566c5e]">{code}</p>
                      <h3 className="serif mt-1 text-lg text-[#18372a]">{name}</h3>
                    </div>
                    <span className={formed
                      ? "rounded-full border border-[#b9d8c3] px-2 py-1 text-[9px] text-[#176b4a]"
                      : "rounded-full border border-[#d7e5da] px-2 py-1 text-[9px] text-[#566c5e]"}
                    >
                      {formed ? "Formed" : "Not formed"}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-[#d7e5da] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#566c5e]">Rule status</p>
                    <p className="mt-1 text-xs leading-5 text-[#18372a]">
                      {evaluation
                        ? textValue(pick(evaluation, "qualification"), formed ? "ALL_FORMATION_CONDITIONS_MET" : "FORMATION_CONDITIONS_NOT_MET")
                        : "No persisted evaluation in this chart record"}
                    </p>
                    {evaluation ? (
                      <p className="mt-2 text-[10px] text-[#566c5e]">
                        Engine: {textValue(pick(evaluation, "engine_version"), "YOGA_ENGINE_V1")}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-[#d7e5da] bg-[#ffffff] p-4">
            <p className="text-xs leading-6 text-[#566c5e]">
              Yoga rules currently exposed by the calculation layer are shown as
              factual formation checks only. No strength ranking, cancellation
              interpretation, or prediction is added in this screen.
            </p>
          </div>
        </section>
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <a href={"/calculations/" + id + "/dasha"} className="panel rounded-2xl p-6 transition hover:border-[#b9d8c3]">
            <p className="eyebrow">Screen 14</p>
            <h2 className="serif mt-2 text-2xl text-[#18372a]">විංශෝත්තරී දශා · Vimśottarī Daśā</h2>
            <p className="mt-3 text-sm leading-6 text-[#566c5e]">Open the persisted Vimśottarī calculation output and Mahādaśā sequence.</p>
            <span className="mt-5 inline-block text-xs text-[#176b4a]">Open Face 14 →</span>
          </a>
          <a href={"/calculations/" + id + "/transit"} className="panel rounded-2xl p-6 transition hover:border-[#b9d8c3]">
            <p className="eyebrow">Screen 15</p>
            <h2 className="serif mt-2 text-2xl text-[#18372a]">ගෝචර · Transit</h2>
            <p className="mt-3 text-sm leading-6 text-[#566c5e]">Calculate and inspect the persisted Transit V1 planetary positions.</p>
            <span className="mt-5 inline-block text-xs text-[#176b4a]">Open Face 15 →</span>
          </a>
        </section>

        <footer className="mt-6 border-t border-[#d7e5da] pt-5 text-xs leading-6 text-[#566c5e]">
          Calculation layer only. Classical interpretation, evidence
          synthesis, modifiers, and prediction output remain downstream
          layers and are not silently mixed into this record.
        </footer>
      </div>
      </main>
    </>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d7e5da] p-3">
      <p className="text-[10px] tracking-[0.14em] text-[#566c5e]">{label}</p>
      <p className="mt-1 break-words text-xs text-[#18372a]">{value}</p>
    </div>
  );
}
