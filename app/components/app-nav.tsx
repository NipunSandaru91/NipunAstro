import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SI_COPY } from "@/lib/ui/sinhala-copy";

const items = [
  ["/dashboard","⌂","මුල් පිටුව","dashboard"],
  ["/my-chart","◉",SI_COPY.myCharts,"chart"],
  ["/predictions","✦","පුරෝකථන","predictions"],
  ["/profile","◎","පැතිකඩ","profile"],
] as const;

export default async function AppNav({active}:{active?:string}) {
  const supabase = await createClient();
  const {data:claims} = await supabase.auth.getClaims();
  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : null;
  const {data:profile} = await supabase.from("profiles").select("display_name").single();
  const name = profile?.display_name || email?.split("@")[0] || "Nipun";

  return <>
    <header className="na-app-header">
      <div className="na-app-header-inner">
        <Link href="/dashboard" className="na-menu-mark" aria-label="මුල් පිටුව">☰</Link>
        <Link href="/dashboard" className="na-wordmark">NIPUN ASTRO</Link>
        <Link href="/profile" className="na-avatar" aria-label="පැතිකඩ">{name.slice(0,1).toUpperCase()}</Link>
      </div>
    </header>
    <nav className="na-bottom-nav si-text" aria-label="ප්‍රධාන මෙනුව">
      {items.map(([href,icon,label,key]) => (
        <Link key={key} href={href} className={active===key ? "active" : ""}>
          <span>{icon}</span><small>{label}</small>
        </Link>
      ))}
    </nav>
  </>;
}
