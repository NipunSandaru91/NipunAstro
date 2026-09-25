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

  const [{ data: rowsData, error }, { count: userCount }, { count: chartCount }, { data: standard }] = await Promise.all([
    supabase.from("user_calculation_runs_v1")
      .select("id,status,engine_version,ephemeris_version,calculation_timestamp,input_place_name")
      .order("calculation_timestamp", { ascending: false }).limit(12),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("user_calculation_runs_v1").select("id", { count: "exact", head: true }),
    supabase.schema("jyotisha").from("system_standards").select("standard_code,version,status,ayanamsa,ephemeris,house_system,node_method").eq("is_default", true).maybeSingle(),
  ]);

  const rows = (rowsData ?? []) as Calculation[];
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
                Operational control surface for NipunAstro Beta V1. Calculation integrity stays separate from interpretation.
              </p>
            </div>
            <span className="rounded-full border border-[#8f7740] bg-[#17140e] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#e0b65b]">ADMIN</span>
          </div>

          {error ? <section className="mt-7 rounded-2xl border border-[#5a3434] bg-[#211416] p-5 text-sm text-[#d8aaaa]">Operational calculation data could not be loaded.</section> : null}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <AdminModule title="Users" value={String(userCount ?? 0)} detail="Registered profiles" icon="01" />
            <AdminModule title="Charts" value={String(chartCount ?? 0)} detail="Calculation records" icon="02" />
            <AdminModule title="Calculation" value={String(completed)} detail={`${failed} failed in latest 12`} icon="03" />
            <AdminModule title="Audit log" value="Read-only" detail="Audit surface pending" icon="04" />
            <AdminModule title="Settings" value={standard?.version ?? "—"} detail={standard?.standard_code ?? "Default standard"} icon="05" />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="panel rounded-2xl p-5 sm:p-7">
              <div className="flex items-end justify-between gap-3">
                <div><p className="eyebrow">Charts · Calculation</p><h2 className="serif mt-2 text-2xl text-[#eee9de]">Recent engine output</h2></div>
                <span className="text-[10px] text-[#676d76]">Latest 12 visible records</span>
              </div>
              <div className="mt-5 overflow-x-auto rounded-xl border border-[#252a31]">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-[#15191f] text-[#777d86]"><tr>
                    <th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Place</th><th className="px-4 py-3 font-medium">Engine</th><th className="px-4 py-3 font-medium">Ephemeris</th><th className="px-4 py-3 font-medium">Timestamp</th>
                  </tr></thead>
                  <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#252a31]">
                    <td className="px-4 py-3 text-[#c9c4b9]">{row.status}</td>
                    <td className="px-4 py-3 text-[#c9c4b9]">{row.input_place_name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-[#b8954f]">{row.engine_version}</td>
                    <td className="px-4 py-3 text-[#9ba6b2]">{row.ephemeris_version}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#777d86]">{new Date(row.calculation_timestamp).toLocaleString()}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </div>

            <aside className="panel rounded-2xl p-6">
              <p className="eyebrow">Settings</p>
              <h2 className="serif mt-2 text-2xl text-[#eee9de]">Jyotiṣa Standard</h2>
              <div className="mt-5 space-y-3">
                <Setting label="Standard" value={standard?.standard_code ?? "—"} />
                <Setting label="Version" value={standard?.version ?? "—"} />
                <Setting label="Ayanāṃśa" value={standard?.ayanamsa ?? "—"} />
                <Setting label="Ephemeris" value={standard?.ephemeris ?? "—"} />
                <Setting label="House system" value={standard?.house_system ?? "—"} />
                <Setting label="Node method" value={standard?.node_method ?? "—"} />
              </div>
              <div className="mt-5 rounded-xl border border-[#4a3d27] bg-[#15130e] p-4 text-xs leading-5 text-[#b7a77c]">
                Settings are displayed as the active calculation standard. Changes are intentionally not exposed in this Beta V1 surface.
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-5 md:grid-cols-2">
            <ModuleDetail title="Users" text="User identity and role boundaries remain controlled by Supabase Auth, profiles, roles, and RLS." />
            <ModuleDetail title="Audit log" text="The visual module is reserved in the locked admin design. A dedicated audit-log data surface is not connected yet, so no synthetic events are shown." />
          </section>
        </div>
      </main>
    </>
  );
}

function AdminModule({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: string }) {
  return <article className="panel rounded-2xl p-5 transition hover:border-[#8f7740]">
    <div className="flex items-start justify-between"><p className="text-[10px] uppercase tracking-[0.14em] text-[#676d76]">{icon}</p><span className="text-[9px] text-[#8f7740]">MODULE</span></div>
    <h2 className="serif mt-3 text-xl text-[#eee9de]">{title}</h2>
    <p className="mt-2 text-2xl text-[#e0b65b]">{value}</p>
    <p className="mt-1 text-[10px] leading-5 text-[#777d86]">{detail}</p>
  </article>;
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#252a31] pb-2 text-xs"><span className="text-[#676d76]">{label}</span><span className="text-right text-[#c9c4b9]">{value}</span></div>;
}

function ModuleDetail({ title, text }: { title: string; text: string }) {
  return <section className="panel rounded-2xl p-6"><p className="eyebrow">{title}</p><p className="mt-3 text-sm leading-7 text-[#aeb4bd]">{text}</p></section>;
}
