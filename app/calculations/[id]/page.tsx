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
};

function textValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
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

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#282d35] pb-7">
          <p className="eyebrow">NipunAstro · Calculation Record</p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="serif text-4xl tracking-tight text-[#eee9de]">
                Natal Chart
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
              Observatory
            </a>
          </div>
        </header>

        {engineError ? (
          <section className="mt-7 rounded-2xl border border-[#5a3434] bg-[#211416] p-6">
            <p className="eyebrow">Engine status</p>
            <p className="mt-2 text-sm leading-7 text-[#d8aaaa]">
              {decodeURIComponent(engineError)}
            </p>
          </section>
        ) : null}

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel rounded-2xl p-7">
            <p className="eyebrow">Calculation</p>
            <h2 className="serif mt-2 text-2xl text-[#eee9de]">
              Input and standard
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DataItem label="Calculation ID" value={id} />
              <DataItem
                label="Status"
                value={textValue(pick(calculation, "status"))}
              />
              <DataItem
                label="Birth date"
                value={textValue(
                  pick(calculation, "input_birth_date", "birth_date"),
                )}
              />
              <DataItem
                label="Birth time"
                value={textValue(
                  pick(calculation, "input_birth_time", "birth_time"),
                )}
              />
              <DataItem
                label="Timezone"
                value={textValue(
                  pick(calculation, "input_timezone", "timezone"),
                )}
              />
              <DataItem
                label="Place"
                value={textValue(
                  pick(calculation, "input_place_name", "place_name"),
                )}
              />
              <DataItem
                label="Country"
                value={textValue(pick(calculation, "input_country", "country"))}
              />
              <DataItem
                label="Ayanamsa"
                value={textValue(pick(calculation, "ayanamsa"))}
              />
              <DataItem
                label="Zodiac"
                value={textValue(
                  pick(calculation, "zodiac_type", "zodiac"),
                )}
              />
              <DataItem
                label="House system"
                value={textValue(pick(calculation, "house_system"))}
              />
              <DataItem
                label="Node method"
                value={textValue(pick(calculation, "node_method"))}
              />
              <DataItem
                label="Engine"
                value={textValue(
                  pick(calculation, "engine_version", "engine"),
                )}
              />
            </div>
          </div>

          <div className="panel rounded-2xl p-7">
            <p className="eyebrow">Lagna</p>
            <h2 className="serif mt-2 text-3xl text-[#eee9de]">
              {textValue(pick(lagna, "rashi", "sign", "name", "code"))}
            </h2>

            <div className="mt-6 space-y-3">
              <DataItem
                label="Degree"
                value={textValue(
                  pick(lagna, "longitude", "degree", "absolute_longitude"),
                )}
              />
              <DataItem
                label="Nakṣatra"
                value={textValue(
                  pick(lagna, "nakshatra", "nakshatra_name"),
                )}
              />
              <DataItem
                label="Pada"
                value={textValue(pick(lagna, "pada"))}
              />
            </div>
          </div>
        </section>

        <section className="panel mt-5 rounded-2xl p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">D1 · Graha Positions</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                Sidereal planetary positions
              </h2>
            </div>
            <p className="text-xs text-[#676d76]">
              {grahas.length} graha records
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
                <tr>
                  <th className="px-3 py-3 font-medium">Graha</th>
                  <th className="px-3 py-3 font-medium">Sign</th>
                  <th className="px-3 py-3 font-medium">Degree</th>
                  <th className="px-3 py-3 font-medium">Nakṣatra</th>
                  <th className="px-3 py-3 font-medium">Pada</th>
                  <th className="px-3 py-3 font-medium">Retro</th>
                </tr>
              </thead>
              <tbody>
                {grahas.map((graha, index) => (
                  <tr
                    key={textValue(
                      pick(graha, "code", "graha_code", "name"),
                      String(index),
                    )}
                    className="border-b border-[#252a31] last:border-0"
                  >
                    <td className="px-3 py-4 text-[#eee9de]">
                      {textValue(
                        pick(
                          graha,
                          "sinhala_name",
                          "iast_name",
                          "english_name",
                          "name",
                          "code",
                        ),
                      )}
                    </td>
                    <td className="px-3 py-4 text-[#c9c4b9]">
                      {textValue(pick(graha, "rashi", "sign", "sign_name"))}
                    </td>
                    <td className="px-3 py-4 text-[#c9c4b9]">
                      {textValue(
                        pick(graha, "longitude", "degree", "absolute_longitude"),
                      )}
                    </td>
                    <td className="px-3 py-4 text-[#c9c4b9]">
                      {textValue(pick(graha, "nakshatra", "nakshatra_name"))}
                    </td>
                    <td className="px-3 py-4 text-[#c9c4b9]">
                      {textValue(pick(graha, "pada"))}
                    </td>
                    <td className="px-3 py-4 text-[#c9c4b9]">
                      {textValue(
                        pick(graha, "is_retrograde", "retrograde"),
                        "false",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
        {label}
      </p>
      <p className="mt-1 break-words text-xs text-[#c9c4b9]">{value}</p>
    </div>
  );
}
