import Link from "next/link";
import UiIcon from "@/app/components/ui-icon";
import BrandLogo from "@/app/components/brand-logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

const items = [
  ["/dashboard", "home", "මුල් පිටුව", "dashboard"],
  ["/my-chart", "chart", "කේන්දර", "chart"],
  ["/settings", "settings", "සැකසුම්", "settings"],
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


  return <>
    <header className="ref-app-header">
      <div className="ref-app-header-inner">
        <details className="ref-more-menu">
          <summary aria-label="ගිණුම් මෙනුව" title="මෙනුව"><UiIcon name="menu" /></summary>
          <div className="ref-more-panel">
            <Link href="/chart/new"><span aria-hidden="true">＋</span><b>නව කේන්දරයක්</b></Link>
            <Link href="/forecast"><UiIcon name="sun" /><b>අද ඔබට</b></Link>
            {profile?.account_type === "PROFESSIONAL" ? <><Link href="/timeline"><UiIcon name="timeline" /><b>ජීවන කාලරේඛාව</b></Link><Link href="/predictions"><UiIcon name="chart" /><b>පුරෝකථන</b></Link></> : null}
            <Link href="/profile"><span aria-hidden="true">○</span><b>පැතිකඩ</b></Link>
            <Link href="/settings"><span aria-hidden="true">⚙</span><b>සැකසුම්</b></Link>
            {roleRow?.role==="ADMIN"?<Link href="/admin"><span>◆</span><b>Admin Dashboard</b></Link>:null}
            <form action={signOut}>
              <button type="submit" className="danger"><span aria-hidden="true">↪</span><b>පිටවන්න</b></button>
            </form>
          </div>
        </details>
        <Link href="/dashboard" className="na-app-brand" aria-label="N Astro මුල් පිටුව"><BrandLogo compact /></Link>
        <Link href="/profile" className="ref-user-block" aria-label={`${name} · පැතිකඩ`}><span className="ref-avatar">{name.slice(0,1).toUpperCase()}</span></Link>
      </div>
    </header>
    <nav className="ref-bottom-nav" aria-label="Primary navigation">
      {items.map(([href,icon,label,key])=><Link key={key} href={href} className={active===key?"active":""} aria-current={active===key?"page":undefined}><UiIcon name={icon} /><small>{label}</small></Link>)}
    </nav>
  </>;
}
