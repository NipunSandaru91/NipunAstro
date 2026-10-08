import Link from "next/link";
import UiIcon, { type IconName } from "@/app/components/ui-icon";
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
    supabase.from("profiles").select("account_type,display_name").single(),
    supabase.from("user_roles").select("role").single(),
  ]);
  const owned = (calculations ?? []) as Calculation[];
  const latest = owned.find((chart) => chart.status === "CALCULATED");
  const personal = profile?.account_type === "PERSONAL";
  const chartPath = latest ? `/calculations/${latest.id}` : "/chart/new";
  const name = profile?.display_name || "ඔබ";
  const explorations: { href: string; icon: IconName; label: string; detail: string }[] = [
    { href: chartPath, icon: "chart", label: "D1 කේන්දරය", detail: "ජන්ම ග්‍රහ පිහිටීම්" },
    { href: latest ? `${chartPath}/dasha` : "/chart/new", icon: "clock", label: "දශා", detail: "කාල පරිච්ඡේද" },
    { href: latest ? `${chartPath}/transit` : "/chart/new", icon: "timeline", label: "ගෝචර", detail: "ග්‍රහ ගමන" },
    { href: latest ? "/forecast" : "/chart/new", icon: "sun", label: "අද ඔබට", detail: "දෛනික මඟපෙන්වීම" },
  ];

  return <>
    <AppNav active="dashboard" />
    <main className="ref-app-shell na-dashboard-shell">
      <div className="ref-app-main ref-dashboard">
        <header className="na-home-intro">
          <span className="na-account-badge">{personal ? "Personal" : "Professional"}</span>
          <h1>{personal ? `ආයුබෝවන්, ${name}` : "කේන්දර විශ්ලේෂණය"}</h1>
        </header>

        {actionError ? <div className="ref-action-error" role="alert">
          උපන් තොරතුරු සුරැකීමට නොහැකි විය. ස්ථානය සහ උපන් වේලාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.
          <Link href="/chart/new">නැවත උත්සාහ කරන්න →</Link>
        </div> : null}
        {listError ? <div className="ref-action-error" role="alert">කේන්දර ලැයිස්තුව ලබාගත නොහැක. පිටුව නැවත විවෘත කරන්න.</div> : null}

        <div className="na-home-layout">
          <div className="na-home-primary">
            {personal ? <section className="na-daily-hero" aria-labelledby="daily-title">
              <div className="na-hero-heading"><UiIcon name="sun" /><div><h2 id="daily-title">අද ඔබට</h2><p>දවසේ මඟපෙන්වීම</p></div></div>
              <div className="na-daily-topics">
                {([{ icon: "money", label: "මුදල්" }, { icon: "career", label: "රැකියාව" }, { icon: "heart", label: "සබඳතා" }] as const).map(item => <Link key={item.label} href={latest ? "/forecast" : "/chart/new"}><UiIcon name={item.icon} /><span>{item.label}</span><UiIcon name="arrow" /></Link>)}
              </div>
              <Link className="na-hero-button" href={latest ? "/forecast" : "/chart/new"}>{latest ? "විස්තර බලන්න" : "කේන්දරයක් එක් කරන්න"}<UiIcon name="arrow" /></Link>
            </section> : <>
              <Link href="/my-chart" className="na-chart-selection"><UiIcon name="chart" /><span>{latest?.subject_name || "කේන්දරය තෝරන්න"}</span><UiIcon name="arrow" /></Link>
              <section className="na-timeline-hero" aria-labelledby="timeline-title">
                <div className="na-hero-heading"><UiIcon name="timeline" /><div><h2 id="timeline-title">අතීත / අනාගත</h2><p>ජීවිතයේ වැදගත් කාල පරාස</p></div></div>
                <Link className="na-button" href={latest ? `/timeline?calculation=${encodeURIComponent(latest.id)}` : "/chart/new"}>ටයිම් ලයින් බලන්න<UiIcon name="arrow" /></Link>
              </section>
            </>}
            {personal ? <>
              <Link href={chartPath} className="na-chart-shortcut"><UiIcon name="chart" /><span><strong>මගේ කේන්දරය</strong><small>{latest?.subject_name || "උපන් තොරතුරු ඇතුළත් කරන්න"}{latest ? " · D1" : ""}</small></span><UiIcon name="arrow" /></Link>
              <Link href="/chart/new" className="na-new-chart"><UiIcon name="plus" />නව කේන්දරයක්</Link>
            </> : <>
              <div className="na-action-grid">{explorations.map(item => <Link key={item.label} href={item.href}><UiIcon name={item.icon} /><span><strong>{item.label}</strong><small>{item.detail}</small></span><UiIcon name="arrow" /></Link>)}</div>
              <section className="na-reading-shortcut"><h2>කේන්දර කියවීම</h2><p>මාතෘකාව අනුව ජන්ම සාක්ෂි සහ දශා විමසන්න.</p><Link href={latest ? `${chartPath}?tab=predictions` : "/chart/new"}>කියවීම විවෘත කරන්න <UiIcon name="arrow" /></Link></section>
            </>}
          </div>
          <aside className="na-home-secondary">
            <section className="na-saved-charts" aria-labelledby="saved-title">
              <div className="na-section-title"><h2 id="saved-title">මගේ කේන්දර</h2><Link href="/my-chart">සියල්ල බලන්න</Link></div>
              {owned.length ? owned.slice(0, 4).map(chart => <Link key={chart.id} href={`/calculations/${chart.id}`}><UiIcon name="chart" /><span><strong>{chart.subject_name || chart.input_place_name || "කේන්දරය"}</strong><small>{chart.input_birth_date}{chart.status !== "CALCULATED" ? " · ගණනය සම්පූර්ණ නැත" : ""}</small></span><UiIcon name="arrow" /></Link>) : <p>{listError ? "දත්ත ලබාගත නොහැක." : "ඔබේ පළමු කේන්දරය එක් කර ආරම්භ කරන්න."}</p>}
            </section>
            {roleRow?.role === "ADMIN" ? <Link className="na-admin-link" href="/admin">පරිපාලන පුවරුව →</Link> : null}
          </aside>
        </div>
      </div>
    </main>
  </>;
}

