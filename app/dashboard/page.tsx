import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Calculation={
  id:string;
  subject_name:string|null;
  input_birth_date:string;
  input_birth_time:string;
  input_timezone:string;
  input_place_name:string|null;
  input_country:string|null;
  calculation_timestamp:string;
  status:string;
};

export default async function Dashboard(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)redirect("/login");
  const [{data:calculations},{data:profile},{data:roleRow}]=await Promise.all([
    supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp",{ascending:false}),
    supabase.from("profiles").select("account_type").single(),
    supabase.from("user_roles").select("role").single(),
  ]);
  const isAdmin=roleRow?.role==="ADMIN";
  const owned=(calculations??[]) as Calculation[];
  const latest=owned[0];

  const features=[
    {href:latest?"/calculations/"+latest.id:"/chart/new",icon:"✧",label:"ජන්ම කේන්දරය"},
    {href:latest?"/calculations/"+latest.id+"/dasha":"/chart/new",icon:"◌",label:"දශා විශ්ලේෂණය"},
    {href:latest?"/calculations/"+latest.id+"/transit":"/chart/new",icon:"▥",label:"ගෝචර"},
    {href:"/my-chart",icon:"▤",label:"කේන්දර ඉතිහාසය"},
    {href:"/predictions",icon:"◇",label:"පුරෝකථන"},
    {href:"/profile",icon:"✣",label:"පැතිකඩ"},
    ...(isAdmin?[{href:"/admin",icon:"◆",label:"Admin Dashboard"}]:[]),
  ];

  const latestTitle=latest?.subject_name??latest?.input_place_name??"Natal chart";

  if(profile?.account_type==="PERSONAL"){
    return <><AppNav active="dashboard"/><main className="ref-app-shell"><div className="ref-app-main">
      <section className="ref-feature-hero">
        <div className="ref-feature-copy">
          <p>PERSONAL · D1</p>
          <h1>{latest?latestTitle:"ඔබේ පළමු කේන්දරය"}</h1>
          <span>{latest?(latest.input_place_name?latest.input_place_name+" · ":"")+latest.input_birth_date:"උපන් තොරතුරු ඇතුළත් කර සරල D1 කියවීමක් සාදන්න"}</span>
        </div>
        <Link href={latest?"/calculations/"+latest.id:"/chart/new"} className="ref-round-arrow">→</Link>
        <div className="ref-hero-orbit" aria-hidden="true"><i/><b/><span>✦</span></div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link href={latest?"/calculations/"+latest.id:"/chart/new"} className="ref-feature-tile"><span className="ref-feature-icon">✧</span><b>මගේ D1 කියවීම</b></Link>
        <Link href="/chart/new" className="ref-feature-tile"><span className="ref-feature-icon">＋</span><b>නව කේන්දරය</b></Link>
        <Link href="/my-chart" className="ref-feature-tile"><span className="ref-feature-icon">▤</span><b>මගේ කේන්දර</b></Link>
        <Link href="/settings" className="ref-feature-tile"><span className="ref-feature-icon">⚙</span><b>Account type</b></Link>
        {isAdmin?<Link href="/admin" className="ref-feature-tile"><span className="ref-feature-icon">◆</span><b>Admin Dashboard</b></Link>:null}
      </section>

      <section className="ref-insight-card">
        <div><p>භාව 12</p><h2>ජීවිත ක්ෂේත්‍ර 12 සඳහා සරල, එකට ගැළපූ සිංහල විග්‍රහය</h2></div>
        <Link href={latest?"/calculations/"+latest.id:"/chart/new"} className="ref-round-arrow">→</Link>
      </section>

      {latest?<section className="ref-latest-card"><div><small>දැනට තෝරාගත් chart එක</small><h3>{latestTitle}</h3><p>{latest.input_place_name?latest.input_place_name+" · ":""}{latest.input_birth_date} · {latest.input_birth_time}</p></div><Link href={"/calculations/"+latest.id} className="ref-small-gold">කියවීම →</Link></section>:null}
    </div></main></>;
  }

  return <><AppNav active="dashboard"/><main className="ref-app-shell"><div className="ref-app-main">
    <section className="ref-feature-hero">
      <div className="ref-feature-copy">
        <p>ඔබේ ජන්ම කේන්දරය</p>
        <h1>{latest?latestTitle:"පළමු කේන්දරය සාදන්න"}</h1>
        <span>{latest?(latest.input_place_name?latest.input_place_name+" · ":"")+latest.input_birth_date:"නිවැරදි උපන් තොරතුරු ඇතුළත් කරන්න"}</span>
      </div>
      <Link href={latest?"/calculations/"+latest.id:"/chart/new"} className="ref-round-arrow">→</Link>
      <div className="ref-hero-orbit" aria-hidden="true"><i/><b/><span>✦</span></div>
    </section>

    <section className="ref-feature-grid">
      {features.map(x=><Link href={x.href} key={x.label} className="ref-feature-tile"><span className="ref-feature-icon">{x.icon}</span><b>{x.label}</b></Link>)}
    </section>

    <section className="ref-insight-card">
      <div><p>දෛනික තේමාව</p><h2>ඔබේ chart එකෙන් evidence-backed විග්‍රහයක් බලන්න</h2></div>
      <Link href="/predictions" className="ref-round-arrow">→</Link>
    </section>

    {latest?<section className="ref-latest-card"><div><small>දැනට තෝරාගත් chart එක</small><h3>{latestTitle}</h3><p>{latest.input_place_name?latest.input_place_name+" · ":""}{latest.input_birth_date} · {latest.input_birth_time}</p></div><Link href={"/predictions?calculation="+latest.id} className="ref-small-gold">පුරෝකථන →</Link></section>:null}
  </div></main></>;
}
