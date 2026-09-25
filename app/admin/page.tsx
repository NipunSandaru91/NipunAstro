import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

type Calculation = {
  id: string;
  status: string;
  engine_version: string;
  ephemeris_version: string;
  calculation_timestamp: string;
  input_place_name: string | null;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: role } = await supabase.from("user_roles").select("role").single();

  if (role?.role !== "ADMIN") redirect("/");

  const { data, error } = await supabase
    .from("user_calculation_runs_v1")
    .select("id,status,engine_version,ephemeris_version,calculation_timestamp,input_place_name")
    .order("calculation_timestamp", { ascending: false })
    .limit(12);

  const rows = (data ?? []) as Calculation[];
  const completed = rows.filter((row) => row.status === "CALCULATED" || row.status === "COMPLETED").length;
  const failed = rows.filter((row) => /FAIL|ERROR/i.test(row.status)).length;

  return (
    <>
      <AppNav />
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Screen 18 · Administration</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="serif text-4xl text-[#eee9de]">Admin Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Protected operational surface for the calculation-first Beta V1.
              </p>
            </div>
            <span className="rounded-full border border-[#8f7740] bg-[#17140e] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#e0b65b]">
              ADMIN
            </span>
          </div>

          {error ? (
            <section className="mt-7 rounded-2xl border border-[#5a3434] bg-[#211416] p-5 text-sm text-[#d8aaaa]">
              Operational calculation data could not be loaded.
            </section>
          ) : null}

          <section className="mt-7 grid gap-4 sm:grid-cols-3">
            <Metric label="Visible calculation records" value={String(rows.length)} />
            <Metric label="Calculated / completed" value={String(completed)} />
            <Metric label="Error / failed" value={String(failed)} />
          </section>

          <section className="panel mt-5 rounded-2xl p-5 sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Calculation monitor</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">Recent engine output</h2>
              </div>
              <span className="text-[10px] text-[#676d76]">Latest 12 visible records</span>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-[#252a31]">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[#15191f] text-[#777d86]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Place</th>
                    <th className="px-4 py-3 font-medium">Engine</th>
                    <th className="px-4 py-3 font-medium">Ephemeris</th>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-[#252a31]">
                      <td className="px-4 py-3 text-[#c9c4b9]">{row.status}</td>
                      <td className="px-4 py-3 text-[#c9c4b9]">{row.input_place_name ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-[#b8954f]">{row.engine_version}</td>
                      <td className="px-4 py-3 text-[#9ba6b2]">{row.ephemeris_version}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#777d86]">
                        {new Date(row.calculation_timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-[#676d76]">
              This first Beta V1 admin surface respects the existing RLS boundary. It does not bypass user ownership or expose private records from another account.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#676d76]">{label}</p>
      <p className="serif mt-2 text-3xl text-[#e0b65b]">{value}</p>
    </div>
  );
}
