import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";
import { calculateTransit } from "@/app/calculations/actions";
import {
  buildTransitNatalAnalysis,
  type BhavaInput,
  type NatalGrahaInput,
  type TransitPositionInput,
  type TransitInteractionType,
  type TransitTrend,
} from "@/lib/prediction/timing/transit-analysis";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    transit?: string;
    transit_error?: string;
    snapshot?: string;
  }>;
};

type TransitRow = TransitPositionInput & {
  id?: string;
  source_engine?: string | null;
  source_version?: string | null;
};

type ChartData = {
  lagna?: Record<string, unknown> | null;
  grahas?: Array<Record<string, unknown>>;
  bhavas?: Array<Record<string, unknown>>;
};

const GRAHA_SI: Record<number, string> = {
  1: "රවි",
  2: "චන්ද්‍ර",
  3: "කුජ",
  4: "බුධ",
  5: "ගුරු",
  6: "ශුක්‍ර",
  7: "ශනි",
  8: "රාහු",
  9: "කේතු",
};

const RASI_SI = [
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

const BHAVA_THEME: Record<number, string> = {
  1: "ශරීරය · ස්වභාවය · ආරම්භ",
  2: "ධනය · වචනය · පවුල",
  3: "ධෛර්යය · සන්නිවේදනය · සහෝදරයන්",
  4: "නිවස · මව · අභ්‍යන්තර සුවය",
  5: "අධ්‍යාපනය · බුද්ධිය · දරුවන් · නිර්මාණශීලීත්වය",
  6: "සේවය · රෝග · ණය · තරඟ",
  7: "විවාහය · සහකාරත්වය · ගිවිසුම්",
  8: "පරිවර්තනය · රහස් · හවුල් සම්පත්",
  9: "උසස් අධ්‍යාපනය · ධර්මය · දිගු ගමන්",
  10: "වෘත්තිය · කාර්යභාරය · ප්‍රසිද්ධ ක්‍රියාකාරිත්වය",
  11: "ලාභ · ජාල · අභිලාෂ",
  12: "වියදම් · විදේශ · විරාමය · නිදහස් කිරීම",
};

function pick(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
) {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return undefined;
}

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatSnapshot(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function interactionLabel(type: TransitInteractionType) {
  if (type === "CONJUNCTION") return "සංයෝගය";
  if (type === "SEVENTH") return "7 වන දෘෂ්ටිය";
  if (type === "MARS_SPECIAL") return "කුජ විශේෂ දෘෂ්ටිය";
  if (type === "JUPITER_SPECIAL") return "ගුරු විශේෂ දෘෂ්ටිය";
  return "ශනි විශේෂ දෘෂ්ටිය";
}

function trendLabel(trend: TransitTrend) {
  if (trend === "APPROACHING") return "ළඟා වෙමින්";
  if (trend === "SEPARATING") return "ඈත් වෙමින්";
  if (trend === "STABLE") return "ස්ථාවර";
  if (trend === "ENTERED_CONTACT") return "නව contact";
  return "පෙර snapshot නැත";
}

export default async function TransitPage({ params, searchParams }: Props) {
  const { id } = await params;
  const paramsValue = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("account_type").single();
  if (profile?.account_type === "PERSONAL") redirect("/dashboard");

  const [{ data: run }, { data: chartData, error: chartError }, { data: positionRows }] =
    await Promise.all([
      supabase
        .schema("jyotisha")
        .from("calculation_runs")
        .select(
          "id,subject_name,input_birth_date,input_birth_time,input_timezone,input_place_name,status",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.rpc("get_user_calculation_chart_v1", {
        p_calculation_id: id,
      }),
      supabase
        .schema("jyotisha")
        .from("transit_positions")
        .select("*")
        .eq("calculation_id", id)
        .order("transit_at", { ascending: false })
        .order("graha_id", { ascending: true }),
    ]);

  if (!run) notFound();
  if (chartError?.code === "42501" || !chartData) notFound();
  if (chartError) throw new Error(chartError.message);

  const chart = chartData as ChartData;
  const lagnaRasiId = num(pick(chart.lagna, "rasi_id"));
  if (!lagnaRasiId) throw new Error("TRANSIT_LAGNA_NOT_AVAILABLE");

  const natalGrahas = (chart.grahas ?? [])
    .map((row) => {
      const graha_id = num(pick(row, "graha_id"));
      const rasi_id = num(pick(row, "rasi_id"));
      const longitude_sidereal = num(
        pick(row, "longitude_sidereal", "longitude"),
      );
      return graha_id && rasi_id && longitude_sidereal !== undefined
        ? { graha_id, rasi_id, longitude_sidereal }
        : null;
    })
    .filter((row): row is NatalGrahaInput => row !== null);

  const bhavas = (chart.bhavas ?? [])
    .map((row) => {
      const bhava_id = num(pick(row, "bhava_id", "number"));
      const rasi_id = num(pick(row, "rasi_id"));
      const lord_graha_id = num(pick(row, "lord_graha_id"));
      return bhava_id && rasi_id && lord_graha_id
        ? { bhava_id, rasi_id, lord_graha_id }
        : null;
    })
    .filter((row): row is BhavaInput => row !== null);

  const allPositions = (positionRows ?? []) as TransitRow[];
  const snapshots = [
    ...new Set(
      allPositions
        .map((row) => row.transit_at)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const requestedSnapshot = paramsValue.snapshot
    ? decodeURIComponent(paramsValue.snapshot)
    : undefined;
  const nowMs = Date.now();
  const latestPastSnapshot = snapshots.find(
    (snapshot) => new Date(snapshot).getTime() <= nowMs,
  );
  const selectedAt =
    requestedSnapshot && snapshots.includes(requestedSnapshot)
      ? requestedSnapshot
      : latestPastSnapshot ?? snapshots[0];

  const selectedIndex = selectedAt ? snapshots.indexOf(selectedAt) : -1;
  const previousAt =
    selectedIndex >= 0 && selectedIndex + 1 < snapshots.length
      ? snapshots[selectedIndex + 1]
      : undefined;

  const selectedRows = selectedAt
    ? allPositions.filter((row) => row.transit_at === selectedAt)
    : [];
  const previousRows = previousAt
    ? allPositions.filter((row) => row.transit_at === previousAt)
    : [];

  const analysis = selectedAt
    ? buildTransitNatalAnalysis({
        lagnaRasiId,
        transits: selectedRows,
        previousTransits: previousRows,
        natalGrahas,
        bhavas,
      })
    : [];

  const interactionsCount = analysis.reduce(
    (sum, row) => sum + row.interactions.length,
    0,
  );
  const closeContacts = analysis.reduce(
    (sum, row) =>
      sum + row.interactions.filter((interaction) => interaction.orb_degrees <= 3).length,
    0,
  );
  const ingressCount = analysis.filter(
    (row) => row.ingress_since_previous_snapshot,
  ).length;
  const timezone = String(run.input_timezone ?? "UTC");
  const title = run.subject_name ?? run.input_place_name ?? "Natal chart";

  return (
    <>
      <AppNav />
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-[#282d35] pb-6">
            <a
              href={"/calculations/" + id}
              className="text-xs text-[#b8954f]"
            >
              ← Calculation report
            </a>
            <p className="eyebrow mt-6">Transit Analysis V2</p>
            <h1 className="serif mt-2 text-4xl text-[#eee9de]">
              ගෝචර විශ්ලේෂණය
            </h1>
            <p className="mt-3 text-sm text-[#8f9aa7]">
              {title} · Transit snapshot → natal bhāva → natal graha interaction
            </p>
          </header>

          <section className="panel mt-6 rounded-2xl p-6 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Transit calculation</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                  දිනයක් සහ වේලාවක් සඳහා snapshot එකක් ගණනය කරන්න
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#8f9aa7]">
                  Lahiri sidereal Transit V1 astronomical output එක මත V2
                  natal interaction analysis එක ගොඩනගයි.
                </p>
              </div>
              <div className="text-xs text-[#676d76]">
                Timezone: {timezone || "—"}
              </div>
            </div>

            {paramsValue.transit_error ? (
              <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-4 text-sm leading-6 text-[#d8aaaa]">
                {decodeURIComponent(paramsValue.transit_error)}
              </div>
            ) : null}

            {paramsValue.transit ? (
              <div className="mt-5 rounded-xl border border-[#2f4938] bg-[#0d1b16] p-4 text-sm text-[#b5d0ba]">
                Transit snapshot එක සාර්ථකව ගණනය කර සුරකින ලදී.
              </div>
            ) : null}

            <form
              action={calculateTransit}
              className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <input type="hidden" name="calculation_id" value={id} />
              <input type="hidden" name="timezone" value={timezone} />
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#697787]">
                  Transit date
                </span>
                <input
                  name="transit_date"
                  type="date"
                  required
                  className="mt-2 w-full rounded-xl border border-[#343a43] bg-[#0d1014] px-3 py-3 text-sm text-[#eee9de] outline-none focus:border-[#8f7740]"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#697787]">
                  Transit time
                </span>
                <input
                  name="transit_time"
                  type="time"
                  required
                  className="mt-2 w-full rounded-xl border border-[#343a43] bg-[#0d1014] px-3 py-3 text-sm text-[#eee9de] outline-none focus:border-[#8f7740]"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#15130e] hover:brightness-110"
                >
                  Calculate Transit
                </button>
              </div>
              <label className="flex items-center gap-3 text-xs text-[#8d929b] md:col-span-3">
                <span>Node method</span>
                <select
                  name="node_method"
                  defaultValue="MEAN"
                  className="rounded-lg border border-[#343a43] bg-[#0d1014] px-3 py-2 text-xs text-[#d4cfc4]"
                >
                  <option value="MEAN">Mean Node</option>
                  <option value="TRUE">True Node</option>
                </select>
              </label>
            </form>
          </section>

          {snapshots.length ? (
            <section className="panel mt-5 rounded-2xl p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">Saved snapshots</p>
                  <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                    Snapshot තෝරන්න
                  </h2>
                </div>
                <p className="text-xs text-[#676d76]">
                  {snapshots.length} saved snapshot{snapshots.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {snapshots.slice(0, 12).map((snapshot) => (
                  <Link
                    key={snapshot}
                    href={
                      "/calculations/" +
                      id +
                      "/transit?snapshot=" +
                      encodeURIComponent(snapshot)
                    }
                    className={
                      snapshot === selectedAt ? "astro-chip active" : "astro-chip"
                    }
                  >
                    {formatSnapshot(snapshot, timezone)}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {selectedAt ? (
            <>
              <section className="cosmic-hero mt-5 rounded-[28px] border border-[#725626] p-6 sm:p-8">
                <p className="eyebrow">Transit Snapshot</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="Selected time"
                    value={formatSnapshot(selectedAt, timezone)}
                  />
                  <Metric
                    label="Natal contacts"
                    value={String(interactionsCount)}
                  />
                  <Metric label="≤ 3° contacts" value={String(closeContacts)} />
                  <Metric
                    label="Sign changes"
                    value={previousAt ? String(ingressCount) : "—"}
                  />
                </div>
                {previousAt ? (
                  <p className="mt-4 text-xs leading-6 text-[#8c939b]">
                    Trend සහ sign-change labels පෙර saved snapshot එක (
                    {formatSnapshot(previousAt, timezone)}) සමඟ සසඳා ගණනය කරයි.
                    මෙය exact ingress time එකක් ලෙස අර්ථ දක්වන්නේ නැහැ.
                  </p>
                ) : (
                  <p className="mt-4 text-xs leading-6 text-[#8c939b]">
                    පෙර snapshot එකක් නැති නිසා approaching / separating සහ
                    ingress comparison තවම ලබාගත නොහැක.
                  </p>
                )}
              </section>

              <section className="mt-5 grid gap-4 lg:grid-cols-2">
                {analysis.map((row) => (
                  <article key={row.graha_id} className="astro-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Transit graha</p>
                        <h2 className="serif mt-1 text-2xl text-[#f0e4c8]">
                          {GRAHA_SI[row.graha_id] ?? row.graha_id}
                        </h2>
                        <p className="mt-1 text-xs text-[#79838d]">
                          {RASI_SI[row.rasi_id - 1]} ·{" "}
                          {Number(row.degree_in_rasi ?? 0).toFixed(2)}°
                          {row.is_retrograde ? " · වක්‍ර" : ""}
                        </p>
                      </div>
                      <span className="strength-pill">
                        භාව {row.natal_bhava}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Info
                        label="Natal house"
                        value={
                          "භාව " +
                          row.natal_bhava +
                          " · " +
                          (BHAVA_THEME[row.natal_bhava] ?? "—")
                        }
                      />
                      <Info
                        label="House lord"
                        value={
                          row.natal_bhava_lord_graha_id
                            ? GRAHA_SI[row.natal_bhava_lord_graha_id] ??
                              String(row.natal_bhava_lord_graha_id)
                            : "—"
                        }
                      />
                    </div>

                    {row.ingress_since_previous_snapshot ? (
                      <div className="mt-3 rounded-xl border border-[#725626] bg-[#17140e] p-3 text-xs leading-6 text-[#d4bf91]">
                        පෙර saved snapshot එකේ{" "}
                        {row.previous_rasi_id
                          ? RASI_SI[row.previous_rasi_id - 1]
                          : "වෙනත් රාශියක"}{" "}
                        සිට දැන් {RASI_SI[row.rasi_id - 1]} වෙත sign change එකක්
                        පෙනේ.
                      </div>
                    ) : null}

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[.14em] text-[#707984]">
                          Natal interactions
                        </p>
                        {row.house_lord_contact ? (
                          <span className="rounded-full border border-[#8f7740] px-2 py-1 text-[9px] text-[#d8b66b]">
                            House-lord contact
                          </span>
                        ) : null}
                      </div>

                      {row.interactions.length ? (
                        <div className="mt-3 space-y-2">
                          {row.interactions.map((interaction) => (
                            <div
                              key={
                                interaction.target_graha_id +
                                "-" +
                                interaction.type
                              }
                              className="rounded-xl border border-[#2c3640] bg-[#081017] p-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm text-[#d8d0c2]">
                                    {GRAHA_SI[row.graha_id] ?? row.graha_id} →{" "}
                                    {GRAHA_SI[interaction.target_graha_id] ??
                                      interaction.target_graha_id}
                                  </p>
                                  <p className="mt-1 text-[11px] text-[#7d8791]">
                                    {interactionLabel(interaction.type)} · orb{" "}
                                    {interaction.orb_degrees.toFixed(2)}°
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <span className="rounded-full border border-[#34475b] px-2 py-1 text-[9px] text-[#8fa3b5]">
                                    {trendLabel(interaction.trend)}
                                  </span>
                                  {interaction.orb_degrees <= 1 ? (
                                    <p className="mt-1 text-[9px] text-[#d8b66b]">
                                      near exact
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-[#39434e] p-4 text-xs leading-6 text-[#78828c]">
                          මෙම snapshot එකේ conjunction හෝ classical graha-dṛṣṭi
                          contact එකක් හමු නොවීය.
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </section>

              <section className="panel mt-5 rounded-2xl p-6 sm:p-7">
                <p className="eyebrow">Verified astronomical output</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                  Raw transit positions
                </h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
                      <tr>
                        <th className="px-3 py-3">ග්‍රහයා</th>
                        <th className="px-3 py-3">රාශිය</th>
                        <th className="px-3 py-3">අංශක</th>
                        <th className="px-3 py-3">Natal bhāva</th>
                        <th className="px-3 py-3">වක්‍ර</th>
                        <th className="px-3 py-3">Engine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.map((row) => {
                        const source = selectedRows.find(
                          (item) => item.graha_id === row.graha_id,
                        );
                        return (
                          <tr
                            key={row.graha_id}
                            className="border-b border-[#252a31] last:border-0"
                          >
                            <td className="px-3 py-4 text-[#eee9de]">
                              {GRAHA_SI[row.graha_id] ?? row.graha_id}
                            </td>
                            <td className="px-3 py-4 text-[#c9c4b9]">
                              {RASI_SI[row.rasi_id - 1]}
                            </td>
                            <td className="px-3 py-4 font-mono text-xs text-[#c9c4b9]">
                              {Number(row.degree_in_rasi ?? 0).toFixed(4)}°
                            </td>
                            <td className="px-3 py-4 text-[#c9c4b9]">
                              {row.natal_bhava}
                            </td>
                            <td className="px-3 py-4 text-[#c9c4b9]">
                              {row.is_retrograde ? "ඔව්" : "නැහැ"}
                            </td>
                            <td className="px-3 py-4 text-[#676d76]">
                              {source?.source_engine ?? "—"} ·{" "}
                              {source?.source_version ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="mt-5 rounded-xl border border-[#4a3d27] bg-[#15130e] p-5 text-sm text-[#c9c4b9]">
              තවම Transit snapshot එකක් calculate කර නැත.
            </section>
          )}

          <footer className="mt-6 border-t border-[#282d35] pt-5 text-xs leading-6 text-[#676d76]">
            V2 interaction labels natal chart geometry සහ saved transit snapshots
            මත පදනම් වේ. Daily/Weekly/Monthly/Yearly forecast එක තවම මෙයින්
            generate නොකරයි.
          </footer>
        </div>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#6d552b] bg-[#0c1116]/80 p-4">
      <p className="text-[9px] uppercase tracking-[.14em] text-[#7c766b]">
        {label}
      </p>
      <p className="serif mt-1 text-lg text-[#ead9b4]">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#29323b] bg-[#091016] p-3">
      <p className="text-[9px] uppercase tracking-[.12em] text-[#68717b]">
        {label}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#c9c4b9]">{value}</p>
    </div>
  );
}
