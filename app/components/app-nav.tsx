import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SI_COPY } from "@/lib/ui/sinhala-copy";

const items = [
  ["/dashboard","⌂","මුල් පිටුව","dashboard"],
  ["/my-chart","⌬",SI_COPY.myCharts,"chart"],
  ["/predictions","▤","දැනුම","knowledge"],
  ["/predictions","✣","පුරෝකථන","predictions"],
  ["/profile","•••","තවත්","profile"],
] as const;

export default async function AppNav({active}:{active?:string}) {
  const supabase = await createClient();
  const {data:claims} = await supabase.auth.getClaims();
  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : null;
  const {data:profile} = await supabase.from("profiles").select("display_name").single();
  const name = profile?.display_name || email?.split("@")[0] || "Nipun";

  return (
    <>
      <header className="ap-app-header">
        <div className="ap-app-header-inner">
          <Link href="/profile" className="ap-user-block">
            <span className="ap-avatar">{name.slice(0,1).toUpperCase()}</span>
            <span><b>{name}</b><small>සුබ දවසක්!</small></span>
          </Link>
          <Link href="/predictions" className="ap-bell" aria-label="දැනුම්දීම්">♧</Link>
        </div>
      </header>
      <nav className="ap-bottom-nav" aria-label="ප්‍රධාන මෙනුව">
        {items.map(([href,icon,label,key]) => (
          <Link key={key} href={href} className={active===key ? "active" : ""}>
            <span>{icon}</span><small>{label}</small>
          </Link>
        ))}
      </nav>
    </>
  );
}
