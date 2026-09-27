import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SI_COPY } from "@/lib/ui/sinhala-copy";

type Calculation={id:string;input_birth_date:string;input_birth_time:string;input_timezone:string;input_place_name:string|null;input_country:string|null;calculation_timestamp:string;status:string};

export default async function Dashboard(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)redirect("/login");
  const {data:calculations}=await supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp",{ascending:false});
  const owned=(calculations??[]) as Calculation[];
  const latest=owned[0];

  const features=[
    {href:latest?"/calculations/"+latest.id:"/chart/new",icon:"✧",label:SI_COPY.natalChart},
    {href:latest?"/calculations/"+latest.id+"/dasha":"/chart/new",icon:"◌",label:"දශා විශ්ලේෂණය"},
    {href:latest?"/calculations/"+latest.id+"/transit":"/chart/new",icon:"▥",label:"ගෝචර"},
    {href:"/my-chart",icon:"▤",label:"හදහන් ඉතිහාසය"},
    {href:"/predictions",icon:"◇",label:"පුරෝකථන"},
    {href:"/profile",icon:"✣",label:"පැතිකඩ"},
  ];

  return <><AppNav active="dashboard"/><main className="astro-shell ref-app-shell"><div className="ref-app-main">
    <section className="ref-feature-hero">
      <div className="ref-feature-copy">
        <p>ඔබේ ජන්ම හදහන</p>
        <h1>{latest?"විස්තර මෙතනින්":"පළමු හදහන සාදන්න"}</h1>
        <span>{latest?(latest.input_place_name??"Natal chart")+" · "+latest.input_birth_date:"නිවැරදි උපන් තොරතුරු ඇතුළත් කර හදහන සාදන්න"}</span>
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

    {latest?<section className="ref-latest-card"><div><small>දැනට තෝරාගත් හදහන</small><h3>{latest.input_place_name??"Natal chart"}</h3><p>{latest.input_birth_date} · {latest.input_birth_time}</p></div><Link href={"/predictions?calculation="+latest.id} className="ref-small-gold">පුරෝකථන →</Link></section>:null}
  </div></main></>;
}
