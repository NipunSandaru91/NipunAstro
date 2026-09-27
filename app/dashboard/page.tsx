import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Calculation={id:string;input_birth_date:string;input_birth_time:string;input_timezone:string;input_place_name:string|null;input_country:string|null;calculation_timestamp:string;status:string};

export default async function Dashboard(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)redirect("/login");
  const {data:calculations}=await supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp",{ascending:false});
  const owned=(calculations??[]) as Calculation[];
  const latest=owned[0];

  const features=[
    {href:latest?"/calculations/"+latest.id:"/chart/new",icon:"☼",label:"ජන්ම හදහන"},
    {href:latest?"/calculations/"+latest.id+"/dasha":"/chart/new",icon:"♄",label:"දශා විශ්ලේෂණය"},
    {href:latest?"/calculations/"+latest.id+"/transit":"/chart/new",icon:"▥",label:"ගෝචර"},
    {href:"/my-chart",icon:"▤",label:"හදහන් ඉතිහාසය"},
    {href:"/predictions",icon:"◇",label:"පුරෝකථන"},
    {href:"/profile",icon:"✦",label:"මගේ පැතිකඩ"},
  ];

  return (
    <>
      <AppNav active="dashboard"/>
      <main className="ap-app-shell">
        <div className="ap-app-main">
          <section className="ap-dashboard-hero">
            <div className="ap-dashboard-copy">
              <p>ඔබේ ජන්ම හදහන</p>
              <h1>{latest?"විස්තර බලන්න":"පළමු හදහන සාදන්න"}</h1>
              <span>{latest?(latest.input_place_name??"Natal chart")+" · "+latest.input_birth_date:"නිවැරදි උපන් තොරතුරු ඇතුළත් කර chart එක සාදන්න"}</span>
            </div>
            <div className="ap-mini-cosmos" aria-hidden="true"><i/><i/><i/><b>☉</b></div>
            <Link href={latest?"/calculations/"+latest.id:"/chart/new"} className="ap-round-arrow">→</Link>
          </section>

          <section className="ap-feature-grid">
            {features.map(x=><Link href={x.href} key={x.label} className="ap-feature-tile"><span>{x.icon}</span><b>{x.label}</b></Link>)}
          </section>

          <section className="ap-dashboard-banner">
            <div><small>දෛනික ජ්‍යෝතිෂ දැනුම</small><h2>ග්‍රහ පිහිටීම් සහ කාල රටා පැහැදිලිව බලන්න</h2></div>
            <Link href="/predictions" className="ap-round-arrow">→</Link>
          </section>

          {latest ? (
            <section className="ap-latest-card">
              <div><small>දැනට තෝරාගත් හදහන</small><h3>{latest.input_place_name??"Natal chart"}</h3><p>{latest.input_birth_date} · {latest.input_birth_time}</p></div>
              <Link href={"/calculations/"+latest.id} className="ap-outline-button">විවෘත කරන්න</Link>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
