import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { loadDeepDasha } from "@/lib/calculations/load-deep-dasha";
import {
  type DailySky,
  localDate,
  panchanga,
  rahuInterval,
  validateDailyInput,
} from "@/lib/daily/sky";
import { buildDailyReading, dailySymbols } from "@/lib/daily/reading";
import {
  GOOD_DIRECTION,
  KARANA,
  MARU,
  NAKSHATRA,
  RASI,
  TITHI,
  WEEKDAY,
  YOGA,
} from "@/lib/daily/labels";
import DailyControls from "./daily-controls";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;
type Chart = {
  lagna?: { rasi_id: number };
  grahas?: { graha_id: number; rasi_id: number }[];
};
const box = "rounded-2xl border border-[#d7e5da] bg-white p-5";

export default async function ForecastPage(
  { searchParams }: { searchParams: Promise<Query> },
) {
  const query = await searchParams;
  const now = new Date().getTime();
  const q = (key: string) =>
    typeof query[key] === "string" ? query[key] as string : undefined;
  const client = await createClient();
  const { data: claims } = await client.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login?next=%2Fforecast");
  const [{ data: runs, error: runsError }, { data: profile }] = await Promise
    .all([
      client.from("user_calculation_runs_v1").select("id,subject_name,status")
        .order("calculation_timestamp", { ascending: false }),
      client.from("profiles").select("account_type").single(),
    ]);
  if (runsError) throw Error("DAILY_CHART_LIST_UNAVAILABLE");
  const charts = (runs ?? []).filter((r) => r.status === "CALCULATED").map(
    (r) => ({ id: String(r.id), name: String(r.subject_name || "මගේ කේන්දරය") }),
  );
  const selected = charts.find((c) => c.id === q("calculation")) ?? charts[0];
  let input = null, inputError = false;
  if (
    q("lat") !== undefined || q("lon") !== undefined || q("tz") !== undefined
  ) {
    try {
      if (!q("lat")?.trim() || !q("lon")?.trim() || !q("tz")) {
        throw Error("MISSING_LOCATION");
      }
      input = validateDailyInput({
        date: q("date") || localDate(now, q("tz")!),
        timezone: q("tz"),
        latitude: Number(q("lat")),
        longitude: Number(q("lon")),
      });
    } catch {
      inputError = true;
    }
  }
  let sky: DailySky | null = null,
    chart: Chart | null = null,
    reading: ReturnType<typeof buildDailyReading> | null = null,
    unavailable = false;
  if (selected && input) {
    try {
      const [ephemeris, natal, dasha] = await Promise.all([
        client.functions.invoke("daily-sky", { body: input }),
        client.rpc("get_user_calculation_chart_v1", {
          p_calculation_id: selected.id,
        }),
        loadDeepDasha(client, selected.id, 2),
      ]);
      if (ephemeris.error || natal.error || !natal.data) {
        throw Error("DAILY_DATA_UNAVAILABLE");
      }
      const result = ephemeris.data as DailySky;
      if (
        result.engine !== "SWISS_MOSEPH_LAHIRI_DAILY_V1" ||
        !Number.isFinite(result.referenceAt) || !Number.isFinite(result.sun) ||
        !Number.isFinite(result.moon) || result.input.date !== input.date ||
        result.input.timezone !== input.timezone
      ) throw Error("INVALID_SKY_RESPONSE");
      sky = result;
      chart = natal.data as Chart;
      if (!chart.lagna || !chart.grahas?.length) {
        throw Error("DAILY_NATAL_MISSING");
      }
      reading = buildDailyReading({
        lagna: Number(chart.lagna.rasi_id),
        positions: chart.grahas.map((g) => ({
          graha_id: Number(g.graha_id),
          rasi_id: Number(g.rasi_id),
        })),
        moonRasi: panchanga(sky.sun, sky.moon).moonRasi,
        at: sky.referenceAt,
        periods: dasha?.periods ?? [],
      });
    } catch {
      sky = null;
      reading = null;
      unavailable = true;
    }
  }
  const weekday = input ? new Date(input.date + "T12:00Z").getUTCDay() : 0;
  const p = sky ? panchanga(sky.sun, sky.moon) : null;
  const rahu = sky ? rahuInterval(weekday, sky.sunrise, sky.sunset) : null;
  const symbols = reading
    ? dailySymbols(weekday, Number(chart!.lagna!.rasi_id))
    : null;
  const format = (ms: number) =>
    new Intl.DateTimeFormat("si-LK", {
      timeZone: input!.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(ms);
  const today = !input || input.date === localDate(now, input.timezone);
  return (
    <>
      <AppNav active="forecast" />
      <main className="astro-shell min-h-screen px-4 pb-28 pt-6 text-[#233e2e]">
        <div className="mx-auto max-w-2xl space-y-4">
          <header className="px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#748779]">
              N ASTRO · දිනපතා
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#176b4a]">
              ☀ {today ? "අද ඔබට" : "ඔබේ දිනපතා කියවීම"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#64786b]">
              ඔබේ දවසට කෙටි මඟපෙන්වීමක්
            </p>
          </header>
          {!selected
            ? (
              <section className={box}>
                <p>දෛනික කියවීම සඳහා ගණනය කළ කේන්දරයක් අවශ්‍යයි.</p>
                <Link
                  className="mt-4 inline-block text-[#176b4a] underline"
                  href="/chart/new"
                >
                  නව කේන්දරයක් සාදන්න
                </Link>
              </section>
            )
            : (
              <DailyControls
                key={selected.id + JSON.stringify(input)}
                charts={charts}
                selectedId={selected.id}
                date={q("date")}
                latitude={q("lat")}
                longitude={q("lon")}
                timezone={q("tz")}
                place={q("place")}
              />
            )}
          {inputError && (
            <p role="alert" className={box}>
              දිනය, අක්ෂාංශ/දේශාංශ සහ වේලා කලාපය පරීක්ෂා කර නැවත උත්සාහ කරන්න.
            </p>
          )}
          {!input && !inputError && selected && (
            <p className="px-2 text-sm leading-7 text-[#64786b]">
              ඉහත ඔබ සිටින ස්ථානය තෝරා කියවීම විවෘත කරන්න. උපන් ස්ථානය අද සිටින ස්ථානය ලෙස
              ස්වයංක්‍රීයව නොගනී.
            </p>
          )}
          {unavailable && (
            <section role="alert" className={box}>
              <h2 className="font-semibold">කියවීම මේ මොහොතේ ලබාගත නොහැක</h2>
              <p className="mt-2 text-sm leading-7">
                දත්ත සේවාවට සම්බන්ධ විය නොහැකි විය. ඉහත බොත්තමෙන් නැවත උත්සාහ කරන්න. අනුමාන කළ
                කාල හෝ පලාපල පෙන්වන්නේ නැහැ.
              </p>
            </section>
          )}
          {sky && p && reading && symbols && input && (
            <article
              aria-label="දිනපතා කාඩ්පත"
              className="overflow-hidden rounded-3xl border border-[#cddfd2] bg-white shadow-sm"
            >
              <div className="bg-[#edf5ef] p-5 sm:p-6">
                <p className="text-xs text-[#526b59]">
                  {input.date} · {WEEKDAY[weekday]} ·{" "}
                  {(q("place") || "තෝරාගත් ස්ථානය").slice(0, 80)}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-[#176b4a]">
                  {selected.name} · {RASI[Number(chart!.lagna!.rasi_id) - 1]}
                  {" "}
                  ලග්නය
                </h2>
                <p className="mt-3 text-sm leading-8">{reading.summary}</p>
                <p className="mt-2 text-xs text-[#64786b]">
                  {input.timezone} ·{" "}
                  {sky.sunrise === null
                    ? "පංචාංගය: දහවල් 12ට"
                    : "පංචාංගය: හිරු උදාවේදී"} · {format(sky.referenceAt)}
                </p>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                {reading.topics.map((topic) => (
                  <section key={topic.id}>
                    <h3 className="text-sm font-semibold text-[#176b4a]">
                      {topic.label}
                    </h3>
                    <p className="mt-1 text-sm leading-7">{topic.text}</p>
                  </section>
                ))}
                <section className="rounded-xl bg-[#fff8e9] p-4">
                  <h3 className="text-sm font-semibold">
                    ◎ අද අවධානය යොමු කළ යුතු දෙය
                  </h3>
                  <p className="mt-2 text-sm leading-7">{reading.focus}</p>
                </section>
                <section>
                  <h3 className="text-sm font-semibold">සම්ප්‍රදායික දින සංකේත</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["ජය අංක", symbols.numbers.join(" · ")],
                      ["ජය වර්ණ", symbols.colors.join(" / ")],
                      ["සුබ දිශාව", GOOD_DIRECTION[weekday]],
                      ["මරු සිටින දිශාව", MARU[weekday]],
                    ].map(([label, value]) => (
                      <div className="rounded-xl bg-[#f6f8f4] p-3" key={label}>
                        <dt className="text-xs text-[#64786b]">{label}</dt>
                        <dd className="mt-2 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-xs leading-6 text-[#64786b]">
                    අංක/වර්ණ: දින අධිපති හා ලග්නාධිපති සංකේත. දිශා: සත්දින සම්ප්‍රදාය පමණි; පූර්ණ
                    නැකත් තේරීමක් නොවේ. ජයග්‍රහණ හෝ ගමන් ආරක්ෂාව තීරණය නොකරයි.
                  </p>
                </section>
                <section className="rounded-xl border border-[#d7e5da] p-4">
                  <h3 className="text-sm font-semibold">රාහු කාලය · දිවා</h3>
                  <p className="mt-2 text-lg font-semibold text-[#176b4a]">
                    {rahu
                      ? `${format(rahu[0])} – ${format(rahu[1])}`
                      : "මෙම දිනයට ගණනය කළ නොහැක"}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[#64786b]">
                    හිරු උදාව{" "}
                    {sky.sunrise === null ? "නොමැත" : format(sky.sunrise)}{" "}
                    · බැසීම{" "}
                    {sky.sunset === null ? "නොමැත" : format(sky.sunset)}. ස්ථානීය
                    දිවා කාලය අටකට බෙදා ගණනය කර ඇත.
                  </p>
                </section>
                <section>
                  <h3 className="text-sm font-semibold">දවසේ පංචාංගය</h3>
                  <dl className="mt-3 divide-y divide-[#e8eee8] text-sm">
                    {[
                      ["වාරය", WEEKDAY[weekday]],
                      [
                        "තිථිය",
                        p.tithi === 30
                          ? "අමාවක"
                          : `${p.tithi <= 15 ? "පුර" : "අව"} ${
                            TITHI[(p.tithi - 1) % 15]
                          }`,
                      ],
                      ["නැකත", NAKSHATRA[p.nakshatra - 1]],
                      ["යෝගය", YOGA[p.yoga - 1]],
                      ["කරණය", KARANA[p.karana]],
                      ["චන්ද්‍ර රාශිය", RASI[p.moonRasi - 1]],
                    ].map(([label, value]) => (
                      <div
                        className="flex justify-between gap-4 py-2"
                        key={label}
                      >
                        <dt className="text-[#64786b]">{label}</dt>
                        <dd className="text-right font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-xs leading-6 text-[#64786b]">
                    මෙය ඉහත සඳහන් වේලාවේ තත්ත්වයයි. තිථි/නැකැත් දවස තුළ වෙනස් විය හැක; අවසන්
                    වන වේලා මෙම සංස්කරණයේ නැත.
                  </p>
                </section>
                <details className="border-t border-[#d7e5da] pt-4">
                  <summary className="cursor-pointer text-xs text-[#176b4a]">
                    කියවීමේ පදනම සහ ගණනය
                  </summary>
                  <div className="mt-3 space-y-2 text-xs leading-6 text-[#64786b]">
                    <p>
                      මහා දශා → අන්තර් දශා:{" "}
                      {reading.timing}. කෙටි කියවීම සඳහා එම අධිපතින්ගේ ජන්ම භාව සහ චන්ද්‍ර
                      ගෝචර භාව භාවිත කරයි. දශා මට්ටම් 5ම මෙහි අර්ථකථනයට යොදා නැත.
                    </p>
                    {reading.topics.map((t) => (
                      <p key={t.id}>{t.label}: {t.evidence.join("; ")}</p>
                    ))}
                    <p>
                      Swiss Ephemeris / Moshier, ලහිරි අයනාංශය. හිරු උදාව/බැසීම: මුහුදු
                      මට්ටමේ විවෘත ක්ෂිතිජය සහ සම්මත වායු වර්තනය; කඳු, උස සහ කාලගුණය අනුව
                      වෙනස් විය හැක.
                    </p>
                    <p>
                      භාව තේමා තෝරාගැනීම N Astro හි ගුණාත්මක අර්ථකථන නියමයකි ({reading
                        .ruleVersion}); සංඛ්‍යාත්මක සම්භාවිතාවක් නොවේ.
                    </p>
                    <p>
                      <a
                        href="https://lankajhothisha.blogspot.com/2011/04/blog-post_17.html"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        දිශා සම්ප්‍රදාය
                      </a>{" "}
                      ·{" "}
                      <a
                        href="https://www.astro.com/swisseph/swephprg.htm"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        ගණන පදනම
                      </a>
                    </p>
                  </div>
                </details>
                <p className="text-xs leading-6 text-[#64786b]">
                  සාම්ප්‍රදායික ජ්‍යොතිෂමය මඟපෙන්වීමක් පමණි. මූල්‍ය, සෞඛ්‍ය හෝ ජීවිතයේ වැදගත් තීරණ සඳහා
                  එකම පදනම කර නොගන්න.
                </p>
              </div>
            </article>
          )}
          {profile?.account_type === "PROFESSIONAL" && (
            <Link
              className="block py-3 text-center text-sm text-[#176b4a] underline"
              href="/predictions"
            >
              විස්තරාත්මක පුරෝකථන / වෙනත් කාල පරාස
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
