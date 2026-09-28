import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BackButton from "@/app/components/back-button";

const items=[
  ["/dashboard","⌂","මුල් පිටුව","dashboard"],
  ["/my-chart","⌁","කේන්දර","chart"],
  ["/predictions","◉","පුරෝකථන","predictions"],
  ["/forecast","◌","කාල අනාවැකි","forecast"],
  ["/profile","•••","තවත්","profile"],
] as const;

export default async function AppNav({active}:{active?:string}){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const email=typeof claims?.claims?.email==="string"?claims.claims.email:null;
  const {data:profile}=await supabase.from("profiles").select("display_name").single();
  const name=profile?.display_name||email?.split("@")[0]||"Nipun";

  return <>
    <header className="ref-app-header">
      <div className="ref-app-header-inner">
        <div className="flex items-center gap-3">
          {active !== "dashboard" ? <BackButton /> : null}
          <Link href="/dashboard" className="ref-user-block">
          <span className="ref-avatar">{name.slice(0,1).toUpperCase()}</span>
          <span><b>{name}</b><small>සුභ දවසක් !</small></span>
          </Link>
        </div>
        <Link href="/profile" className="ref-bell" aria-label="Profile">♢</Link>
      </div>
    </header>
    <nav className="ref-bottom-nav" aria-label="Primary navigation">
      {items.map(([href,icon,label,key])=><Link key={key} href={href} className={active===key?"active":""}><span>{icon}</span><small>{label}</small></Link>)}
    </nav>
  </>;
}
