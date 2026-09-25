import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import D1Chart from "@/app/components/d1-chart";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
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
  const { error: engineError } = await searchParams;
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

  const chart = data as ChartData;
  const calculation = chart.calculation ?? {};
  const lagna = chart.lagna ?? null;
  const grahas = Array.isArray(chart.grahas) ? chart.grahas : [];
  const shadbala = Array.isArray(chart.shadbala) ? chart.shadbala : [];
  const lagnaRasiId = Number(pick(lagna, "rasi_id"));

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#282d35] pb-7">
          <p className="eyebrow">NipunAstro · ගණනය කිරීමේ වාර්තාව</p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="serif text-4xl tracking-tight text-[#eee9de]">
                උපන් කේන්දරය
              </h1>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Verified calculation output. Interpretation is deliberately
                separated from the astronomical calculation layer.
              </p>
            </div>

            <a
              href="/"
              className="rounded-lg border border-[#343a43] px-3 py-2 text-xs text-[#bdb8ad] transition hover:border-[#8f7740] hover:text-[#eee9de]"
            >
              නිරීක්ෂණාගාරය
            </a>
          </div>
        </header>

        {engineError ? (
          <section className="mt-7 rounded-2xl border border-[#5a3434] bg-[#211416] p-6">
            <p className="eyebrow">එන්ජින් තත්ත්වය</p>
            <p className="mt-2 text-sm leading-7 text-[#d8aaaa]">
              {decodeURIComponent(engineError)}
            </p>
          </section>
        ) : null}

        {!engineError ? (
        <section className="mt-7 rounded-3xl border border-[#2f4938] bg-[#0d1b16] p-5 shadow-2xl sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#b8954f] bg-[#15130e]">
              <span className="text-2xl text-[#e0b65b]">✓</span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8eb596]">
                8 / 8 · Chart Ready
              </p>
              <h2 className="serif mt-1 text-2xl text-[#eee9de]">
                Chart calculated successfully
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#8f9aa7]">
                Your verified calculation is ready to explore. The values below
                come directly from the calculation layer.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#778392]">
                Lagna · D1
              </p>
              <p className="serif mt-1 text-2xl text-[#e0b65b]">
                {textValue(
                  rashiSinhala(pick(lagna, "rasi_id")) ??
                    pick(lagna, "rashi", "sign", "name", "code"),
                )}
              </p>
              <p className="mt-1 text-xs text-[#9ca7b3]">
                {textValue(pick(lagna, "degree_in_rasi", "degree", "longitude_in_rasi"))}°
              </p>
            </div>

            <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#778392]">
                Nakṣatra
              </p>
              <p className="serif mt-1 text-2xl text-[#eee9de]">
                {textValue(
                  nakshatraSinhala(pick(lagna, "longitude_sidereal", "longitude")) ??
                    pick(lagna, "nakshatra", "nakshatra_name"),
                )}
              </p>
              <p className="mt-1 text-xs text-[#9ca7b3]">
                Pada {textValue(pick(lagna, "pada"))}
              </p>
            </div>
          </div>

          <a
            href="#chart-details"
            className="mt-4 block w-full rounded-2xl border border-[#e0b65b] bg-[#e0b65b] px-4 py-3.5 text-center text-sm font-semibold text-[#15130e] transition hover:brightness-110"
          >
            View Chart
          </a>
        </section>

        ) : null}

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel rounded-2xl p-7">
            <p className="eyebrow">ගණනය කිරීම</p>
            <h2 className="serif mt-2 text-2xl text-[#eee9de]">
              ආදානය සහ සම්මතය
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-4 rounded-2xl border border-[#3c3527] bg-[#0d1014] p-5">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[var(--gold)] bg-[#15130e]">
                  <span className="serif text-2xl text-[var(--gold)]">
                    {textValue(rashiSinhala(pick(lagna, "rasi_id")) ?? pick(lagna, "rashi", "sign", "name", "code"))}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#676d76]">
                    Sidereal Lagna
                  </p>
                  <h2 className="serif mt-1 text-3xl text-[#eee9de]">
                    {textValue(rashiSinhala(pick(lagna, "rasi_id")) ?? pick(lagna, "rashi", "sign", "name", "code"))}
                  </h2>
                  <p className="mt-1 text-xs text-[#8d929b]">
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

            <div className="mt-4 rounded-xl border border-[#252a31] bg-[#0d1014] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#676d76]">
                Sidereal longitude
              </p>
              <p className="mt-2 font-mono text-sm text-[#c9c4b9]">
                {textValue(pick(lagna, "longitude_sidereal", "longitude"))}°
              </p>
              <p className="mt-2 text-xs leading-5 text-[#676d76]">
                Lahiri ayanāṃśa · Whole Sign · Calculation layer only
              </p>
            </div>
          </div>
        </section>

        <section className="panel mt-5 rounded-3xl p-4 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Chart Overview</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                D1 · Rāśi
              </h2>
            </div>
            <span className="text-[10px] text-[#687586]">Screen 10 · Bhāva</span>
          </div>

          <nav className="mt-5 grid grid-cols-4 overflow-hidden rounded-xl border border-[#34475b] bg-[#091522]" aria-label="Chart sections">
            <a href="#d1-chart" className="border-b-2 border-[#e0b65b] bg-[#182a3b] px-2 py-3 text-center text-[10px] font-semibold text-[#eee9de]">D1</a>
            <a href="#bhava" className="px-2 py-3 text-center text-[10px] text-[#8f9aa7]">භාව</a>
            <a href="#drishti" className="px-2 py-3 text-center text-[10px] text-[#8f9aa7]">Dṛṣṭi</a>
            <a href="#shadbala" className="px-2 py-3 text-center text-[10px] text-[#8f9aa7]">Ṣaḍbala</a>
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
            <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#778392]">Lagna</p>
              <p className="serif mt-1 text-lg text-[#e0b65b]">{textValue(rashiSinhala(lagnaRasiId))}</p>
            </div>
            <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#778392]">Grahas</p>
              <p className="serif mt-1 text-lg text-[#eee9de]">{grahas.length}</p>
            </div>
            <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#778392]">System</p>
              <p className="mt-1 text-xs text-[#c9c4b9]">Lahiri · Whole Sign</p>
            </div>
          </div>
        </section>

        
        <section id="bhava" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · භාව</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">භාව 12</h2>
            </div>
            <p className="text-xs text-[#676d76]">Whole Sign · Lagna-based</p>
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
                  className={house === 1 ? "rounded-2xl border border-[#b8954f] bg-[#17140e] p-4" : "rounded-2xl border border-[#34475b] bg-[#091522] p-4"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a949f]">
                        භාව {house}
                      </p>
                      <h3 className="serif mt-1 text-lg text-[#eee9de]">
                        {house === 1 ? "ලග්න භාවය" : "භාව " + house}
                      </h3>
                    </div>
                    {house === 1 ? (
                      <span className="rounded-full border border-[#8f7740] px-2 py-1 text-[9px] text-[#e0b65b]">
                        ලග්නය
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 border-t border-[#252a31] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#697787]">රාශිය</p>
                    <p className="mt-1 text-sm text-[#d4cfc4]">{rashiSinhala(rashiId) ?? "—"}</p>
                    <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-[#697787]">ග්‍රහයන්</p>
                    <p className="mt-1 text-sm leading-6 text-[#c9c4b9]">
                      {planets.length ? planets.map((planet) => String(grahaSinhala(planet))).join(" · ") : "ග්‍රහයන් නොමැත"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-6 text-[#676d76]">
            භාව mapping එක Lagna Rāśi මත පදනම් වූ Whole Sign calculation එකෙන් ලබා ගනී.
            භාවාධිපති වැනි interpretation-layer data මෙහි නොගොඩනගයි.
          </p>
        </section>


        <section id="drishti" className="panel mt-5 rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · දෘෂ්ටි</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">ග්‍රහ දෘෂ්ටි</h2>
            </div>
            <p className="text-xs text-[#676d76]">Graha Dṛṣṭi · Calculation view</p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#34475b] bg-[#091522] p-4">
            <p className="text-xs leading-6 text-[#9ca7b3]">
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
                  className="rounded-2xl border border-[#34475b] bg-[#091522] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#697787]">ග්‍රහයා</p>
                      <h3 className="serif mt-1 text-lg text-[#eee9de]">{textValue(grahaSinhala(graha))}</h3>
                    </div>
                    <span className="rounded-full border border-[#405163] px-2 py-1 text-[9px] text-[#9ba6b2]">
                      {rashiSinhala(rashiId) ?? "—"}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-[#252a31] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#697787]">දෘෂ්ටි කරන ස්ථාන</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {targets.map(({ offset, targetRasiId, targetBhava }) => (
                        <span
                          key={offset}
                          className="rounded-xl border border-[#3b4652] bg-[#0d1b2b] px-3 py-2 text-xs text-[#d4cfc4]"
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
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                නිරයණ ග්‍රහ පිහිටීම්
              </h2>
            </div>
            <p className="text-xs text-[#676d76]">{grahas.length} ග්‍රහ වාර්තා</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
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
                      className="border-b border-[#252a31] last:border-0"
                    >
                      <td className="px-3 py-4 text-[#c9c4b9]">
                        {textValue(bhava)}
                      </td>
                      <td className="px-3 py-4 text-[#eee9de]">
                        {textValue(grahaSinhala(graha))}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">
                        {textValue(
                          rashiSinhala(pick(graha, "rasi_id")) ??
                            pick(graha, "rashi", "sign", "sign_name"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">
                        {textValue(
                          pick(graha, "degree_in_rasi", "degree", "longitude_in_rasi"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">
                        {textValue(
                          nakshatraSinhala(
                            pick(graha, "longitude_sidereal", "longitude"),
                          ) ?? pick(graha, "nakshatra", "nakshatra_name"),
                        )}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">
                        {textValue(pick(graha, "pada"))}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">
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
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">ෂඩ්බලය · ග්‍රහ බල</h2>
            </div>
            <p className="text-xs text-[#676d76]">Actual calculation output · Virupa</p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#34475b] bg-[#091522] p-4">
            <p className="text-xs leading-6 text-[#9ca7b3]">
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
                    className="rounded-2xl border border-[#34475b] bg-[#091522] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#697787]">
                          ග්‍රහයා
                        </p>
                        <h3 className="serif mt-1 text-xl text-[#eee9de]">{name}</h3>
                      </div>

                      <div className="rounded-xl border border-[#8f7740] bg-[#15130e] px-3 py-2 text-right">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[#8c826c]">
                          මුළු බල
                        </p>
                        <p className="font-mono text-sm text-[#e0b65b]">
                          {textValue(pick(row, "total_bala"))}
                        </p>
                        {rupa !== undefined ? (
                          <p className="mt-0.5 text-[9px] text-[#8d929b]">
                            {rupa.toFixed(2)} Rupa
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {items.map(([label, key]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-[#252f3a] bg-[#0d141d] p-3"
                        >
                          <p className="text-[9px] leading-4 text-[#697787]">{label}</p>
                          <p className="mt-1 font-mono text-xs text-[#c9c4b9]">
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
            <div className="mt-5 rounded-2xl border border-[#4a3d27] bg-[#15130e] p-5">
              <p className="text-sm text-[#c9c4b9]">ෂඩ්බල දත්ත මෙම calculation record එකේ නොමැත.</p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-[#252a31] bg-[#0d1014] p-4">
            <p className="text-xs leading-6 text-[#676d76]">
              ගණනය කිරීමේ මූලික ඒකකය Virupa වේ. 60 Virupa = 1 Rupa.
              දෘක් බලයට සෘණ අගයක් ලැබිය හැක. මෙහි Rupa අගය total_bala / 60 ලෙස
              presentation සඳහා පමණක් පෙන්වයි.
            </p>
          </div>
        </section>

        <footer className="mt-6 border-t border-[#282d35] pt-5 text-xs leading-6 text-[#676d76]">
          Calculation layer only. Classical interpretation, evidence
          synthesis, modifiers, and prediction output remain downstream
          layers and are not silently mixed into this record.
        </footer>
      </div>
    </main>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#252a31] p-3">
      <p className="text-[10px] tracking-[0.14em] text-[#676d76]">{label}</p>
      <p className="mt-1 break-words text-xs text-[#c9c4b9]">{value}</p>
    </div>
  );
}
