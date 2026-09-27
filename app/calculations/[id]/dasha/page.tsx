import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

type Props={params:Promise<{id:string}>};
const GRAHA_SI:Record<number,string>={1:"රවි",2:"චන්ද්‍ර",3:"කුජ",4:"බුධ",5:"ගුරු",6:"ශුක්‍ර",7:"ශනි",8:"රාහු",9:"කේතු"};
const GRAHA_GLYPH:Record<number,string>={1:"☉",2:"☽",3:"♂",4:"☿",5:"♃",6:"♀",7:"♄",8:"☊",9:"☋"};

function dateOnly(value:unknown){if(!value)return "—";const s=String(value);return s.slice(0,10)}
function isActive(start:unknown,end:unknown){const now=Date.now();const a=Date.parse(String(start));const b=Date.parse(String(end));return Number.isFinite(a)&&Number.isFinite(b)&&now>=a&&now<b}

export default async function DashaPage({params}:Props){
  const {id}=await params;
  const supabase=await createClient();
  const {data:run}=await supabase.schema("jyotisha").from("calculation_runs").select("id,input_birth_date,input_birth_time,input_timezone,input_place_name,status").eq("id",id).maybeSingle();
  if(!run)notFound();
  const {data:periods}=await supabase.schema("jyotisha").from("mahadasa_periods").select("*").eq("calculation_id",id).order("sequence_order",{ascending:true});
  const rows=periods??[];
  const current=rows.find(p=>isActive(p.start_at,p.end_at))??rows[0];

  return (
    <>
      <AppNav />
      <main className="ap-app-shell">
        <div className="ap-dasha-page">
          <header className="ap-page-title">
            <Link href={"/calculations/"+id} aria-label="ආපසු">←</Link>
            <div><h1>විංශෝත්තරී දශා</h1><span>✦</span></div>
          </header>

          <nav className="ap-report-tabs ap-two-tabs">
            <a className="active" href="#timeline">දශා කාලසටහන</a>
            <a href={"/calculations/"+id}>විස්තර</a>
          </nav>

          {current?(
            <section className="ap-current-dasha">
              <div className="ap-current-planet"><span>{GRAHA_GLYPH[Number(current.graha_id)]??"•"}</span></div>
              <div>
                <small>වත්මන් දශාව</small>
                <h2>{GRAHA_SI[Number(current.graha_id)]??current.graha_id} මහා දශා</h2>
                <p>{dateOnly(current.start_at)} <span>→</span> {dateOnly(current.end_at)}</p>
              </div>
            </section>
          ):null}

          <section id="timeline" className="ap-dasha-timeline">
            {rows.length?rows.map((p,index)=>{
              const active=isActive(p.start_at,p.end_at);const idNum=Number(p.graha_id);
              return <article key={p.id??index} className={active?"active":""}>
                <div className="ap-timeline-dot">{GRAHA_GLYPH[idNum]??"•"}</div>
                <div className="ap-timeline-card">
                  <div><b>{GRAHA_SI[idNum]??p.graha_id}</b>{active?<span>වත්මන්</span>:null}</div>
                  <p>{dateOnly(p.start_at)} – {dateOnly(p.end_at)}</p>
                  <small>{p.duration_years} years</small>
                </div>
                <span className="ap-timeline-arrow">›</span>
              </article>
            }):<div className="ap-empty">මහාදශා දත්ත නොමැත.</div>}
          </section>

          <p className="ap-form-footnote">Vimśottarī Engine · සත්‍යාපිත calculation output</p>
        </div>
      </main>
    </>
  );
}
