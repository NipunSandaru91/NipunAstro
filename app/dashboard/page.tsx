import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";

type Calculation = {
  id: string;
  subject_name: string | null;
  input_birth_date: string;
  input_birth_time: string;
  input_place_name: string | null;
  calculation_timestamp: string;
  status: string;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: actionError } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");
  const [{ data: calculations, error: listError }, { data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp", { ascending: false }),
    supabase.from("profiles").select("account_type").single(),
    supabase.from("user_roles").select("role").single(),
  ]);
  const owned = (calculations ?? []) as Calculation[];
  const latest = owned[0];
  const personal = profile?.account_type === "PERSONAL";
  const chartPath = latest ? `/calculations/${latest.id}` : "/chart/new";
  const explorations = personal
    ? [
      { href: chartPath, icon: "✧", label: "පුරෝකථන මාතෘකා", detail: "D1 සහ තත්කාලීන කියවීම" },
      { href: "/my-chart", icon: "▤", label: "මගේ කේන්දර", detail: "සුරැකි ගණනයන්" },
    ]
    : [
      { href: chartPath, icon: "✧", label: "ජන්ම කේන්දරය", detail: "D1 සහ ග්‍රහ පිහිටීම්" },
      { href: `${chartPath}#personal-predictions`, icon: "✦", label: "පුද්ගලික පුරෝකථන", detail: "D1 සහ දශා කියවීම" },
      { href: latest ? chartPath + "/dasha" : "/chart/new", icon: "◌", label: "දශා විශ්ලේෂණය", detail: "කාල පරිච්ඡේද" },
      { href: latest ? chartPath + "/transit" : "/chart/new", icon: "▥", label: "ගෝචර", detail: "ග්‍රහ ගමන" },
    ];

  return <>
    <AppNav active="dashboard" />
    <main className="ref-app-shell na-dashboard-shell">
      <div className="ref-app-main ref-dashboard">
        <div className="ref-dashboard-intro">
          <div>
            <p className="ref-kicker">N ASTRO · {personal ? "PERSONAL" : "PROFESSIONAL"}</p>
            <h1>ඔබේ නක්ෂත්‍ර නිරීක්ෂණය</h1>
            <p>කේන්දරය තෝරාගෙන එහි ගණනය සහ කියවීම එකම තැනකින් බලන්න.</p>
          </div>
        </div>

        {actionError ? <div className="ref-action-error" role="alert">
          උපන් තොරතුරු සුරැකීමට නොහැකි විය. ස්ථානය සහ උපන් වේලාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.
          <Link href="/chart/new">නැවත උත්සාහ කරන්න →</Link>
        </div> : null}
        {listError ? <div className="ref-action-error" role="alert">කේන්දර ලැයිස්තුව ලබාගත නොහැක. පිටුව නැවත විවෘත කරන්න.</div> : null}

        <div className="ref-dashboard-layout">
          <div className="ref-dashboard-primary">
            <section className="astro-card" aria-labelledby="home-chart-selector-title">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Chart Selector</p>
                  <h2 id="home-chart-selector-title" className="serif mt-2 text-2xl text-[#176b4a]">
                    කේන්දරය තෝරන්න
                  </h2>
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {owned.map((calculation, index) => (
                  <Link
                    key={calculation.id}
                    href={`/calculations/${calculation.id}`}
                    className={index === 0 ? "astro-chip active" : "astro-chip"}
                  >
                    <span className="block">
                      {calculation.subject_name ??
                        calculation.input_place_name ??
                        "Natal chart"}
                    </span>
                    <small className="mt-1 block opacity-60">
                      {calculation.input_birth_date}
                    </small>
                  </Link>
                ))}
                <Link href="/chart/new" className="astro-chip">
                  <span className="block">＋ නව කේන්දරයක්</span>
                  <small className="mt-1 block opacity-60">උපන් තොරතුරු ඇතුළත් කරන්න</small>
                </Link>
              </div>
            </section>

            <section className="ref-dashboard-section" aria-labelledby="explore-title">
              <div className="ref-section-heading"><p className="ref-kicker">EXPLORE</p><h2 id="explore-title">{personal ? "ඔබේ කියවීම" : "ගණනය විමසන්න"}</h2></div>
              <div className="ref-dashboard-cards">
                {explorations.map(item => <Link key={item.label} href={item.href} className="ref-explore-card">
                  <span className="ref-explore-icon" aria-hidden="true">{item.icon}</span><b>{item.label}</b><small>{item.detail}</small><em aria-hidden="true">→</em>
                </Link>)}
              </div>
            </section>
          </div>
          <aside className="ref-dashboard-aside">
            <section className="ref-path-card">
              <p className="ref-kicker">{personal ? "PERSONAL READING" : "EVIDENCE & TIMING"}</p>
              <h2>{personal ? "ඔබේ පුරෝකථන" : "පුරෝකථන සහ කාලය"}</h2>
              <p>{personal ? "ජීවිතයේ ප්‍රධාන මාතෘකා සඳහා D1 සහ දශා කාල කියවන්න." : "භාවය, සාක්ෂි සහ කාලය පියවරෙන් පියවර විමසන්න."}</p>
              <Link href={personal ? chartPath : "/predictions"}>විවෘත කරන්න <span aria-hidden="true">→</span></Link>
            </section>
            <div className="ref-shortcuts">
              <Link href="/settings">ගිණුම් සැකසුම් <span aria-hidden="true">→</span></Link>
              <Link href="/profile">පැතිකඩ <span aria-hidden="true">→</span></Link>
              {roleRow?.role === "ADMIN" ? <Link href="/admin">පරිපාලන පුවරුව <span aria-hidden="true">→</span></Link> : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  </>;
}
