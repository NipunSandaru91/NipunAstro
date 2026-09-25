import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

type Calculation = {
  id: string;
  input_birth_date: string;
  input_birth_time: string;
  input_timezone: string;
  input_place_name: string | null;
  input_country: string | null;
  calculation_timestamp: string;
  status: string;
  engine_version: string;
  ayanamsa: string | null;
  zodiac_type: string | null;
  house_system: string | null;
};

export default async function MyChartPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_calculation_runs_v1")
    .select("*")
    .order("calculation_timestamp", { ascending: false });

  const calculations = (data ?? []) as Calculation[];

  return (
    <>
      <AppNav active="chart" />
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Screen 16 · My Chart</p>
              <h1 className="serif mt-2 text-4xl text-[#eee9de]">My Chart</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Your authenticated chart history, kept separate from system and regression records.
              </p>
            </div>
            <Link href="/chart/new" className="rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#15130e]">
              + New Chart
            </Link>
          </div>

          {error ? (
            <section className="panel mt-7 rounded-2xl p-6">
              <p className="eyebrow">Data surface</p>
              <p className="mt-2 text-sm text-[#d8aaaa]">Chart history could not be loaded.</p>
            </section>
          ) : calculations.length === 0 ? (
            <section className="panel mt-7 rounded-2xl p-8">
              <p className="eyebrow">No chart yet</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">Create your first natal chart</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                The calculation layer will store the verified input and engine output under your account.
              </p>
              <Link href="/chart/new" className="mt-6 inline-flex rounded-xl border border-[#8f7740] px-4 py-3 text-sm text-[#e0b65b]">
                Create chart
              </Link>
            </section>
          ) : (
            <section className="mt-7 space-y-4">
              {calculations.map((chart, index) => (
                <article key={chart.id} className="panel rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#676d76]">
                        Chart {calculations.length - index}
                      </p>
                      <h2 className="serif mt-1 text-2xl text-[#eee9de]">
                        {chart.input_place_name ?? "Natal chart"}
                      </h2>
                      <p className="mt-1 text-xs text-[#777d86]">
                        {chart.input_birth_date} · {chart.input_birth_time} · {chart.input_timezone}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#405645] bg-[#142019] px-3 py-1 text-[10px] text-[#b5d0ba]">
                      {chart.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <Info label="Country" value={chart.input_country ?? "—"} />
                    <Info label="Zodiac" value={chart.zodiac_type ?? "—"} />
                    <Info label="Ayanāṃśa" value={chart.ayanamsa ?? "—"} />
                    <Info label="Engine" value={chart.engine_version ?? "—"} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/calculations/${chart.id}`} className="rounded-lg border border-[#8f7740] px-4 py-2 text-xs text-[#e0b65b]">
                      Open calculation
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          )}

          <p className="mt-6 text-center text-[10px] leading-5 text-[#676d76]">
            Calculation-first surface · no prediction output is mixed into chart records.
          </p>
        </div>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#252a31] bg-[#0d1014] p-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#676d76]">{label}</p>
      <p className="mt-1 break-words text-xs text-[#c9c4b9]">{value}</p>
    </div>
  );
}
