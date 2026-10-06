import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";
import { createClient } from "@/lib/supabase/server";
import BackButton from "@/app/components/back-button";
import { signOut } from "@/app/auth/actions";

const professionalItems=[
  ["/dashboard","⌂","මුල් පිටුව","dashboard"],
  ["/my-chart","⌁","කේන්දර","chart"],
  ["/predictions","◉","පුරෝකථන","predictions"],
  ["/forecast","☀","දෛනික","forecast"],
] as const;
const personalItems=[
  ["/dashboard","⌂","මුල් පිටුව","dashboard"],
  ["/my-chart","⌁","මගේ කේන්දර","chart"],
  ["/forecast","☀","අද ඔබට","forecast"],
  ["/chart/new","＋","නව කේන්දරය","new"],
] as const;

export default async function AppNav({active}:{active?:string}){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const email=typeof claims?.claims?.email==="string"?claims.claims.email:null;
  const [{data:profile},{data:roleRow}]=await Promise.all([
    supabase.from("profiles").select("display_name,account_type").single(),
    supabase.from("user_roles").select("role").single(),
  ]);
  const name=profile?.display_name||email?.split("@")[0]||"ඔබ";
  const items=profile?.account_type==="PERSONAL"?personalItems:professionalItems;

  return <>
    <header className="ref-app-header">
      <div className="ref-app-header-inner">
        <div className="flex items-center gap-3">
          {active !== "dashboard" ? <BackButton /> : null}
          <Link href="/dashboard" className="na-app-brand" aria-label="N Astro මුල් පිටුව"><BrandLogo compact /></Link>
          <Link href="/dashboard" className="ref-user-block">
            <span className="ref-avatar">{name.slice(0,1).toUpperCase()}</span>
            <span><b>{name}</b><small>ඔබේ ගිණුම</small></span>
          </Link>
        </div>

        <details className="ref-more-menu">
          <summary aria-label="ගිණුම් මෙනුව" title="මෙනුව">⋯</summary>
          <div className="ref-more-panel">
            <Link href="/profile"><span aria-hidden="true">○</span><b>පැතිකඩ</b></Link>
            <Link href="/settings"><span aria-hidden="true">⚙</span><b>සැකසුම්</b></Link>
            {roleRow?.role==="ADMIN"?<Link href="/admin"><span>◆</span><b>Admin Dashboard</b></Link>:null}
            <button type="button" disabled className="disabled"><span aria-hidden="true">!</span><b>වාර්තා කරන්න</b><small>ඉදිරියේදී</small></button>
            <form action={signOut}>
              <button type="submit" className="danger"><span aria-hidden="true">↪</span><b>පිටවන්න</b></button>
            </form>
          </div>
        </details>
      </div>
    </header>
    <nav className="ref-bottom-nav" aria-label="Primary navigation">
      {items.map(([href,icon,label,key])=><Link key={key} href={href} className={active===key?"active":""} aria-current={active===key?"page":undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}
    </nav>
  </>;
}
