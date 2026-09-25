import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";
import { calculateTransit } from "@/app/calculations/actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ transit?: string; transit_error?: string }> };

const GRAHA_SI: Record<number, string> = {
  1: "රවි", 2: "චන්ද්‍ර", 3: "කුජ", 4: "බුධ", 5: "ගුරු",
  6: "ශුක්‍ර", 7: "ශනි", 8: "රාහු", 9: "කේතු",
};

export default async function TransitPage({ params, searchParams }: Props) {
  const { id } = await params;
  const paramsValue = await searchParams;
  const supabase = await createClient();

  const { data: run } = await supabase.schema("jyotisha").from("calculation_runs")
    .select("id,input_birth_date,input_birth_time,input_timezone,input_place_name,status")
    .eq("id", id).maybeSingle();
  if (!run) notFound();

  const { data: positions } = await supabase.schema("jyotisha").from("transit_positions")
    .select("*").eq("calculation_id", id).order("graha_id", { ascending: true });

  const timezone = String(run.input_timezone ?? "");

  return (
    <>
      <AppNav />
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-[#282d35] pb-6">
            <a href={"/calculations/" + id} className="text-xs text-[#b8954f]">← Calculation report</a>
            <p className="eyebrow mt-6">Screen 15 · Transit</p>
            <h1 className="serif mt-2 text-4xl text-[#eee9de]">ගෝචර · Transit</h1>
            <p className="mt-3 text-sm text-[#8f9aa7]">Transit Engine V1 · Calculation layer only</p>
          </header>

          <section className="panel mt-6 rounded-2xl p-6 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Transit calculation</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">Calculate positions for a date and time</h2>
                <p className="mt-3 text-sm leading-6 text-[#8f9aa7]">
                  Lahiri sidereal positions are calculated by the existing Transit V1 engine. This screen does not add interpretation.
                </p>
              </div>
              <div className="text-xs text-[#676d76]">Timezone: {timezone || "—"}</div>
            </div>

            {paramsValue.transit_error ? (
              <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-4 text-sm leading-6 text-[#d8aaaa]">
                {decodeURIComponent(paramsValue.transit_error)}
              </div>
            ) : null}
            {paramsValue.transit ? (
              <div className="mt-5 rounded-xl border border-[#2f4938] bg-[#0d1b16] p-4 text-sm text-[#b5d0ba]">
                Transit calculation completed. The table below shows the persisted calculation output.
              </div>
            ) : null}

            <form action={calculateTransit} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="calculation_id" value={id} />
              <input type="hidden" name="timezone" value={timezone} />
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#697787]">Transit date</span>
                <input name="transit_date" type="date" required className="mt-2 w-full rounded-xl border border-[#343a43] bg-[#0d1014] px-3 py-3 text-sm text-[#eee9de] outline-none focus:border-[#8f7740]" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#697787]">Transit time</span>
                <input name="transit_time" type="time" required className="mt-2 w-full rounded-xl border border-[#343a43] bg-[#0d1014] px-3 py-3 text-sm text-[#eee9de] outline-none focus:border-[#8f7740]" />
              </label>
              <div className="flex items-end">
                <button type="submit" className="w-full rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#15130e] hover:brightness-110">
                  Calculate Transit
                </button>
              </div>
              <label className="md:col-span-3 flex items-center gap-3 text-xs text-[#8d929b]">
                <span>Node method</span>
                <select name="node_method" defaultValue="MEAN" className="rounded-lg border border-[#343a43] bg-[#0d1014] px-3 py-2 text-xs text-[#d4cfc4]">
                  <option value="MEAN">Mean Node</option>
                  <option value="TRUE">True Node</option>
                </select>
              </label>
            </form>
          </section>

          <section className="panel mt-5 rounded-2xl p-6 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Verified output</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">Transit positions</h2>
              </div>
              <p className="text-xs text-[#676d76]">{positions?.length ?? 0} persisted rows</p>
            </div>

            {positions?.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
                    <tr>
                      <th className="px-3 py-3">ග්‍රහයා</th>
                      <th className="px-3 py-3">Transit time</th>
                      <th className="px-3 py-3">රාශිය</th>
                      <th className="px-3 py-3">අංශක</th>
                      <th className="px-3 py-3">වක්‍ර</th>
                      <th className="px-3 py-3">Engine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((row, i) => (
                      <tr key={row.id ?? i} className="border-b border-[#252a31] last:border-0">
                        <td className="px-3 py-4 text-[#eee9de]">{GRAHA_SI[Number(row.graha_id)] ?? row.graha_id}</td>
                        <td className="px-3 py-4 font-mono text-xs text-[#c9c4b9]">{row.transit_at ?? "—"}</td>
                        <td className="px-3 py-4 text-[#c9c4b9]">{row.rasi_id ?? "—"}</td>
                        <td className="px-3 py-4 font-mono text-xs text-[#c9c4b9]">{row.degree_in_rasi ?? "—"}</td>
                        <td className="px-3 py-4 text-[#c9c4b9]">{String(row.is_retrograde ?? false)}</td>
                        <td className="px-3 py-4 text-[#676d76]">{row.source_engine ?? "—"} · {row.source_version ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#4a3d27] bg-[#15130e] p-5 text-sm text-[#c9c4b9]">
                තවම Transit snapshot එකක් calculate කර නැත.
              </div>
            )}
          </section>

          <footer className="mt-6 border-t border-[#282d35] pt-5 text-xs leading-6 text-[#676d76]">
            Transit V1 output is displayed as calculated astronomical data only. No prediction or ranking is added here.
          </footer>
        </div>
      </main>
    </>
  );
}
