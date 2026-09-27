import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Calculation = {
  id: string; input_birth_date: string; input_birth_time: string; input_timezone: string;
  input_place_name: string | null; input_country: string | null; calculation_timestamp: string;
  status: string; engine_version: string; ephemeris_version: string; ayanamsa: string | null;
  zodiac_type: string | null; house_system: string | null; node_method: string | null;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: queryError } = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/welcome");

  const { data: calculations, error } = await supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp", { ascending: false });
  const ownedCalculations = (calculations ?? []) as Calculation[];

  return (
    <>
      <AppNav active="dashboard" />
      <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[1fr_.68fr] lg:items-center">
              <div>
                <p className="eyebrow">NipunAstro Observatory</p>
                <h1 className="serif mt-3 text-4xl text-[#f3dfb1] sm:text-5xl">ඔබේ ජ්‍යොතිෂ නිරීක්ෂණාගාරය</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b7b4ad]">සත්‍යාපිත ගණනය, කේන්දර ඉතිහාසය සහ evidence-driven පුරෝකථන එකම ස්ථානයක.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/chart/new" className="cosmic-primary">නව කේන්දරයක් සාදන්න</Link>
                  <Link href="/predictions" className="cosmic-secondary">පුරෝකථන බලන්න</Link>
                </div>
              </div>
              <div className="zodiac-dial" aria-hidden="true"><span>♋</span><i>☉</i><b>♃</b></div>
            </div>
          </section>

          {queryError ? <section className="mt-6 rounded-2xl border border-[#5a3434] bg-[#211416] p-5 text-sm text-[#d8aaaa]">{decodeURIComponent(queryError)}</section> : null}

          <section className="mt-5 grid gap-4 sm:grid-cols-3">
            <Metric label="කේන්දර" value={String(ownedCalculations.length)} hint="ඔබ සතු ගණනය" />
            <Metric label="ගණනය පද්ධතිය" value="Lahiri" hint="Sidereal · Whole Sign" />
            <Metric label="පුරෝකථන" value="Evidence V1" hint="Rule-traceable" />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
            <div className="astro-card">
              <div className="flex items-end justify-between gap-3">
                <div><p className="eyebrow">මගේ කේන්දර</p><h2 className="serif mt-2 text-3xl text-[#f0e4c8]">මෑත ගණනය කිරීම්</h2></div>
                <Link href="/my-chart" className="text-xs text-[#d8b66b]">සියල්ල බලන්න →</Link>
              </div>
              {error ? <p className="mt-6 text-sm text-[#d8aaaa]">ගණනය දත්ත ලබාගත නොහැක.</p> : ownedCalculations.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[#39434e] p-6 text-center"><p className="text-sm text-[#9ba2aa]">තවම පුද්ගලික කේන්දරයක් නැහැ.</p><Link href="/chart/new" className="mt-4 inline-flex text-sm text-[#e0b65b]">පළමු කේන්දරය සාදන්න</Link></div>
              ) : (
                <div className="mt-6 space-y-3">
                  {ownedCalculations.slice(0,3).map((c) => (
                    <Link href={`/calculations/${c.id}`} key={c.id} className="calculation-row">
                      <div><p className="text-sm text-[#ddd6c8]">{c.input_place_name ?? "Natal chart"}</p><p className="mt-1 text-[11px] text-[#707983]">{c.input_birth_date} · {c.input_birth_time}</p></div>
                      <span className="strength-pill">{c.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Pipeline />
          </section>
        </div>
      </main>
    </>
  );
}

function Metric({label,value,hint}:{label:string;value:string;hint:string}) {
  return <div className="astro-card p-5"><p className="text-[10px] uppercase tracking-[.15em] text-[#737b84]">{label}</p><p className="serif mt-2 text-2xl text-[#efd79e]">{value}</p><p className="mt-1 text-xs text-[#777f88]">{hint}</p></div>
}

function Pipeline() {
  return <aside className="astro-card"><p className="eyebrow">Reasoning Pipeline</p><h2 className="serif mt-2 text-2xl text-[#f0e4c8]">සාක්ෂි මාර්ගය</h2>
    <div className="mt-5 space-y-3">{[["01","ගණනය"],["02","භාව / ග්‍රහ සාක්ෂි"],["03","ජ්‍යොතිෂ නීති"],["04","දශා / ගෝචර"],["05","අර්ථකථනය"]].map(([n,l])=><div key={n} className="pipeline-row"><span>{n}</span><p>{l}</p></div>)}</div>
  </aside>
}
