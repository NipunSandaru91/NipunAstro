import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

        <section className="panel mt-5 rounded-2xl p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Ṣaḍbala · ග්‍රහ බල</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                ෂඩ්බලය
              </h2>
            </div>
            <p className="text-xs text-[#676d76]">ග්‍රහ 7 · Virupa / Rupa</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.12em] text-[#676d76]">
                <tr>
                  <th className="px-3 py-3 font-medium">ග්‍රහයා</th>
                  <th className="px-3 py-3 font-medium">ස්ථාන බල</th>
                  <th className="px-3 py-3 font-medium">දිග් බල</th>
                  <th className="px-3 py-3 font-medium">කාල බල</th>
                  <th className="px-3 py-3 font-medium">චේෂ්ටා බල</th>
                  <th className="px-3 py-3 font-medium">නෛසර්ගික බල</th>
                  <th className="px-3 py-3 font-medium">දෘක් බල</th>
                  <th className="px-3 py-3 font-medium">මුළු බල (Rupa)</th>
                </tr>
              </thead>
              <tbody>
                {shadbala.map((row, index) => {
                  const graha = grahas.find(
                    (item) => Number(pick(item, "graha_id")) === Number(pick(row, "graha_id")),
                  );
                  return (
                    <tr key={String(pick(row, "graha_id") ?? index)} className="border-b border-[#252a31] last:border-0">
                      <td className="px-3 py-4 text-[#eee9de]">
                        {textValue(graha ? grahaSinhala(graha) : pick(row, "graha_id"))}
                      </td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "sthana_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "dig_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "kala_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "cheshta_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "naisargika_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "drik_bala"))}</td>
                      <td className="px-3 py-4 text-[#c9c4b9]">{textValue(pick(row, "total_bala"))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#676d76]">
            ගණනය කිරීමේ ඒකකය Virupa වන අතර 60 Virupa = 1 Rupa. දෘක් බලයට සෘණ අගයක් ලැබිය හැක.
          </p>
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
