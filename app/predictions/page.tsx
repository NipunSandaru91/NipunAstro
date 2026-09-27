import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { buildCareerNatalModel } from "@/lib/prediction/topics/career.ts";
import { buildBhavaOverview } from "@/lib/prediction/ui/bhava-overview.ts";
import { buildTransitNatalAnalysis } from "@/lib/prediction/timing/transit-analysis.ts";
import { activateThemesByDasha } from "@/lib/prediction/timing/generic-dasha.ts";
import { activateThemesByTransit } from "@/lib/prediction/timing/generic-transit.ts";
import { combineGenericTiming, timingStatusSi } from "@/lib/prediction/timing/generic-timing.ts";

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
type ChartData={
  calculation?:Record<string,unknown>;
  lagna?:Record<string,unknown>|null;
  grahas?:Array<Record<string,unknown>>;
  bhavas?:Array<Record<string,unknown>>;
  shadbala?:Array<Record<string,unknown>>;
};
function pick(obj:Record<string,unknown>|null|undefined,...keys:string[]){
  if(!obj)return undefined;
  for(const key of keys){const value=obj[key];if(value!==undefined&&value!==null&&value!=="")return value;}
  return undefined;
}
function number(value:unknown){const n=Number(value);return Number.isFinite(n)?n:undefined;}
const RASI=["මේෂ","වෘෂභ","මිථුන","කටක","සිංහ","කන්‍යා","තුලා","වෘශ්චික","ධනු","මකර","කුම්භ","මීන"];
const GRAHA=["","රවි","චන්ද්‍ර","කුජ","බුධ","ගුරු","සිකුරු","ශනි","රාහු","කේතු"];

export default async function PredictionsPage({searchParams}:{searchParams:Promise<{calculation?:string;bhava?:string}>}){
  const params=await searchParams;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)redirect("/login");

  const {data:rows}=await supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp",{ascending:false});
  const calculations=(rows??[]) as Calculation[];
  const selectedId=calculations.some(c=>c.id===params.calculation)?params.calculation:calculations[0]?.id;
  const selectedBhava=Math.min(12,Math.max(1,Number(params.bhava)||1));

  if(!selectedId){
    return <><AppNav active="predictions"/><main className="astro-shell min-h-screen px-4 py-6 sm:px-6"><div className="mx-auto max-w-5xl"><section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9"><p className="eyebrow">Prediction Observatory</p><h1 className="serif mt-3 text-4xl text-[#f3dfb1]">පුරෝකථන</h1><p className="mt-4 text-sm leading-7 text-[#b9b4a9]">පුරෝකථනයක් සඳහා මුලින් සත්‍යාපිත calculation එකක් අවශ්‍යයි.</p><Link href="/chart/new" className="cosmic-primary mt-6">නව කේන්දරයක් සාදන්න</Link></section></div></main></>;
  }

  const {data:chartData,error}=await supabase.rpc("get_user_calculation_chart_v1",{p_calculation_id:selectedId});
  if(error||!chartData)throw new Error(error?.message??"PREDICTION_CHART_NOT_AVAILABLE");
  const chart=chartData as ChartData;
  const lagna=chart.lagna??null;
  const grahas=Array.isArray(chart.grahas)?chart.grahas:[];
  const bhavaRows=Array.isArray(chart.bhavas)?chart.bhavas:[];
  const shadbala=Array.isArray(chart.shadbala)?chart.shadbala:[];
  const lagnaRasiId=number(pick(lagna,"rasi_id"));
  if(!lagnaRasiId)throw new Error("PREDICTION_LAGNA_NOT_AVAILABLE");

  const positions=grahas.map(g=>({graha_id:number(pick(g,"graha_id")),rasi_id:number(pick(g,"rasi_id"))}))
    .filter((x):x is {graha_id:number;rasi_id:number}=>Boolean(x.graha_id&&x.rasi_id));
  const shad=shadbala.map(s=>{
    const graha_id=number(pick(s,"graha_id"));
    const direct=number(pick(s,"total_bala_rupa"));
    const total=number(pick(s,"total_bala"));
    return graha_id?{graha_id,total_bala_rupa:direct??(total!==undefined?total/60:0)}:null;
  }).filter((x):x is {graha_id:number;total_bala_rupa:number}=>x!==null);

  let career:ReturnType<typeof buildCareerNatalModel>|null=null;
  try{career=buildCareerNatalModel({lagnaRasiId,positions,shadbala:shad});}catch{career=null;}

  const natalGrahas=grahas.map(g=>{
    const graha_id=number(pick(g,"graha_id"));
    const rasi_id=number(pick(g,"rasi_id"));
    const longitude_sidereal=number(pick(g,"longitude_sidereal","longitude"));
    return graha_id&&rasi_id&&longitude_sidereal!==undefined?{graha_id,rasi_id,longitude_sidereal}:null;
  }).filter((x):x is {graha_id:number;rasi_id:number;longitude_sidereal:number}=>x!==null);

  const bhavas=bhavaRows.map(b=>{
    const bhava_id=number(pick(b,"bhava_id","number"));
    const rasi_id=number(pick(b,"rasi_id"));
    const lord_graha_id=number(pick(b,"lord_graha_id"));
    return bhava_id&&rasi_id&&lord_graha_id?{bhava_id,rasi_id,lord_graha_id}:null;
  }).filter((x):x is {bhava_id:number;rasi_id:number;lord_graha_id:number}=>x!==null);

  const nowIso=new Date().toISOString();
  const [{data:mdRows},{data:rawTransitRows}]=await Promise.all([
    supabase.schema("jyotisha").from("mahadasa_periods").select("*")
      .eq("calculation_id",selectedId).lte("start_at",nowIso).gt("end_at",nowIso)
      .order("start_at",{ascending:false}).limit(1),
    supabase.schema("jyotisha").from("transit_positions").select("*")
      .eq("calculation_id",selectedId).order("transit_at",{ascending:false}).limit(18),
  ]);
  const currentMd=mdRows?.[0]??null;
  let currentAd:Record<string,unknown>|null=null;
  if(currentMd?.id){
    const {data:adRows}=await supabase.schema("jyotisha").from("antardasa_periods").select("*")
      .eq("mahadasa_id",currentMd.id).lte("start_at",nowIso).gt("end_at",nowIso)
      .order("start_at",{ascending:false}).limit(1);
    currentAd=(adRows?.[0]??null) as Record<string,unknown>|null;
  }

  const transitRows=(rawTransitRows??[]) as Array<Record<string,unknown>>;
  const latestTransitAt=transitRows.length?String(transitRows[0].transit_at??""):null;
  const latestTransitInputs=latestTransitAt?transitRows.filter(r=>String(r.transit_at??"")===latestTransitAt).map(r=>{
    const graha_id=number(r.graha_id),rasi_id=number(r.rasi_id),longitude_sidereal=number(r.longitude_sidereal);
    const degree_in_rasi=number(r.degree_in_rasi);
    return graha_id&&rasi_id&&longitude_sidereal!==undefined?{graha_id,rasi_id,longitude_sidereal,degree_in_rasi,is_retrograde:Boolean(r.is_retrograde),transit_at:String(r.transit_at)}:null;
  }).filter((x):x is {graha_id:number;rasi_id:number;longitude_sidereal:number;degree_in_rasi:number|undefined;is_retrograde:boolean;transit_at:string}=>x!==null):[];

  const transitAnalysis=latestTransitInputs.length?buildTransitNatalAnalysis({
    lagnaRasiId,
    transits:latestTransitInputs,
    natalGrahas,
    bhavas,
  }):[];

  const timingThemes=(career?.themes??[]).map(theme=>({
    topic:"CAREER",
    code:theme.code,
    level:theme.level,
    evidence_grahas:theme.evidence_grahas,
    evidence_houses:theme.evidence_houses??[],
  }));

  const dashaActivations=currentMd&&currentAd?activateThemesByDasha({
    themes:timingThemes,
    mahadasaGrahaId:Number(currentMd.graha_id),
    antardasaGrahaId:Number(currentAd.graha_id),
  }):[];

  const transitActivations=latestTransitInputs.length?activateThemesByTransit({
    themes:timingThemes,
    transitAnalysis,
  }):[];

  const timingRows=timingThemes.map(theme=>{
    const dasha=dashaActivations.find(row=>row.theme_code===theme.code);
    const transit=transitActivations.find(row=>row.theme_code===theme.code);
    const timing=combineGenericTiming({
      topic:theme.topic,
      themeCode:theme.code,
      natalLevel:theme.level,
      dasha:dasha?{available:true,status:dasha.status,activation_level:dasha.activation_level}:{available:false},
      transit:transit?{available:true,status:transit.status,activation_level:transit.activation_level}:{available:false},
    });
    return {theme,dasha,transit,timing};
  });

  const careerItems=career?[...career.primary,...career.contextual]:[];
  const backedBhavas=[...new Set(careerItems.flatMap(x=>[x.source_bhava,x.evidence.placement.bhava]))];
  const overview=buildBhavaOverview({lagnaRasiId,positions,careerEvidenceBhavas:backedBhavas});
  const detail=overview[selectedBhava-1];
  const evidence=careerItems.filter(x=>x.source_bhava===selectedBhava||x.evidence.placement.bhava===selectedBhava);
  const selectedCalc=calculations.find(c=>c.id===selectedId)!;

  return <><AppNav active="predictions"/><main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl">
    <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9">
      <p className="eyebrow">Prediction Observatory · Calculation Bound</p>
      <div className="mt-3 grid gap-7 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div><h1 className="serif text-4xl text-[#f3dfb1] sm:text-5xl">භාව 12 පුරෝකථන නිරීක්ෂණය</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b4a9]">Prediction එක දැන් explicit calculation එකකට බැඳී ඇත. භාව 12 overview එකෙන් එක් භාවයක් විවෘත කර evidence chain එක බලන්න.</p></div>
        <div className="rounded-2xl border border-[#755a2e] bg-[#0b1015]/80 p-4"><p className="text-[10px] uppercase tracking-[.15em] text-[#8c8270]">Prediction for</p><p className="serif mt-1 text-xl text-[#efd69b]">{selectedCalc.subject_name??selectedCalc.input_place_name??"Natal chart"}</p><p className="mt-1 text-xs text-[#8d969f]">{selectedCalc.input_birth_date} · {selectedCalc.input_birth_time}</p><p className="mt-1 break-all text-[9px] text-[#5f6871]">ID · {selectedId}</p></div>
      </div>
    </section>

    <section className="astro-card mt-5">
      <div className="flex items-end justify-between gap-3"><div><p className="eyebrow">Chart Selector</p><h2 className="serif mt-2 text-2xl text-[#f0e4c8]">පුරෝකථනය සඳහා කේන්දරය තෝරන්න</h2></div><Link href={`/calculations/${selectedId}`} className="text-xs text-[#d8b66b]">ගණනය බලන්න →</Link></div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{calculations.map(c=><Link key={c.id} href={`/predictions?calculation=${c.id}&bhava=${selectedBhava}`} className={c.id===selectedId?"astro-chip active":"astro-chip"}><span className="block">{c.subject_name??c.input_place_name??"Natal chart"}</span><small className="mt-1 block opacity-60">{c.input_birth_date}</small></Link>)}</div>
    </section>

    <section className="mt-5">
      <div className="flex items-end justify-between gap-3"><div><p className="eyebrow">12 Bhāva Overview</p><h2 className="serif mt-2 text-3xl text-[#f0e4c8]">භාව 12</h2></div><p className="text-[10px] text-[#67717b]">Career V1 backed houses are marked</p></div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{overview.map(row=><Link key={row.bhava} href={`/predictions?calculation=${selectedId}&bhava=${row.bhava}`} className={row.bhava===selectedBhava?"bhava-prediction-card active":"bhava-prediction-card"}><div className="flex items-center justify-between"><span className="bhava-number">{row.bhava}</span><span className={row.prediction_status==="CAREER_V1"?"bhava-status ready":"bhava-status"}>{row.prediction_status==="CAREER_V1"?"Evidence":"Foundation"}</span></div><h3 className="serif mt-3 text-base text-[#eadcbf]">{row.title_si}</h3><p className="mt-2 text-[11px] text-[#7f8992]">{RASI[row.rasi_id-1]} · {row.graha_ids.length?row.graha_ids.map(id=>GRAHA[id]).join(" · "):"ග්‍රහයන් නැත"}</p></Link>)}</div>
    </section>

    <section className="astro-card mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Bhāva Detail</p><h2 className="serif mt-2 text-3xl text-[#f0e4c8]">භාව {detail.bhava} · {detail.title_si}</h2><p className="mt-3 text-sm text-[#9199a2]">{detail.keywords_si.join(" · ")}</p></div><span className={detail.prediction_status==="CAREER_V1"?"strength-pill":"bhava-status"}>{detail.prediction_status==="CAREER_V1"?"CAREER V1 EVIDENCE":"FOUNDATION ONLY"}</span></div>

      {evidence.length?<div className="mt-6 space-y-4">{evidence.map(item=><article key={item.evidence.id} className="evidence-chain-card">
        <div className="grid gap-3 sm:grid-cols-3"><EvidenceBlock label="ග්‍රහයා" value={item.evidence.qualities.graha.name_si} sub={item.evidence.qualities.graha.keywords_si.join(" · ")}/><EvidenceBlock label="රාශිය" value={item.evidence.qualities.rasi.name_si} sub={`${item.evidence.qualities.rasi.element_si} · ${item.evidence.qualities.rasi.keywords_si.join(" · ")}`}/><EvidenceBlock label="භාවය" value={`භාව ${item.evidence.placement.bhava}`} sub={item.evidence.qualities.bhava.keywords_si.join(" · ")}/></div>
        <div className="mt-4 rounded-xl border border-[#2b3540] bg-[#081017] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#727b84]">යෙදුණු ජ්‍යොතිෂ නීතිය</p><p className="mt-2 text-sm leading-6 text-[#d7cdbb]">{item.evidence.rule.text_si}</p><p className="mt-2 font-mono text-[10px] text-[#6d7680]">{item.evidence.rule.code}</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Factor title="සහායක සාධක" items={item.evidence.strength.supporting.map(x=>x.text_si)}/><Factor title="විරුද්ධ සාධක" items={item.evidence.strength.contradicting.map(x=>x.text_si)}/></div>
      </article>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-[#39434e] p-5"><p className="text-sm leading-7 text-[#9098a1]">මෙම භාවයට Career V1 rule evidence තවම සම්බන්ධ වී නැත. UI එක අසත්‍ය prediction එකක් නිර්මාණය නොකර foundation data පමණක් පෙන්වයි.</p></div>}

      <div className="mt-5 grid gap-3 md:grid-cols-2"><div className="timing-panel"><p className="eyebrow">Timing Engine V1</p><h3 className="serif mt-2 text-xl text-[#eadcbf]">දශා + ගෝචර</h3><div className="mt-3 space-y-2 text-xs leading-6 text-[#828b94]"><p><span className="text-[#b9a77f]">වත්මන් දශාව:</span> {currentMd&&currentAd?`${GRAHA[Number(currentMd.graha_id)]??currentMd.graha_id} / ${GRAHA[Number(currentAd.graha_id)]??currentAd.graha_id}`:"Timing data incomplete"}</p><p><span className="text-[#b9a77f]">ගෝචර snapshot:</span> {latestTransitAt?new Date(latestTransitAt).toLocaleString("en-CA",{timeZone:selectedCalc.input_timezone}):"Snapshot නැත"}</p></div><div className="mt-4 space-y-2">{timingRows.filter(row=>row.theme.evidence_houses.includes(selectedBhava)).length?timingRows.filter(row=>row.theme.evidence_houses.includes(selectedBhava)).map(row=><div key={row.theme.code} className="rounded-xl border border-[#2c3640] bg-[#081017] p-3"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[9px] text-[#68717a]">{row.theme.code}</span><TimingBadge status={row.timing.status}/></div><p className="mt-2 text-[11px] leading-5 text-[#9da5ad]">{timingStatusSi(row.timing.status)}</p>{row.transit?.triggers.length?<p className="mt-1 text-[10px] text-[#6f7983]">Transit evidence · {row.transit.triggers.length} trigger(s)</p>:null}</div>):<p className="text-[11px] text-[#68717a]">මෙම භාවයට timing-bound Career theme එකක් නොමැත.</p>}</div><div className="mt-3 flex gap-2"><Link href={`/calculations/${selectedId}/dasha`} className="cosmic-secondary">දශා බලන්න</Link><Link href={`/calculations/${selectedId}/transit`} className="cosmic-secondary">ගෝචර බලන්න</Link></div></div><div className="timing-panel"><p className="eyebrow">Sinhala Conclusion</p><h3 className="serif mt-2 text-xl text-[#eadcbf]">අවසාන නිගමනය</h3><p className="mt-2 text-xs leading-6 text-[#828b94]">{evidence.length?(timingRows.some(row=>row.theme.evidence_houses.includes(selectedBhava)&&row.timing.status==="ACTIVE_NOW")?"මෙම භාවයට සම්බන්ධ Career natal evidence සමඟ වත්මන් දශා සහ ගෝචර timing සාධක එකවර සක්‍රීය වේ.":"මෙම භාවයට Career natal evidence ඇත. වත්මන් timing state එක evidence සමඟ වෙනම පෙන්වා ඇති අතර data නොමැති තැන නිගමනයක් නිර්මාණය නොකරයි."):"මෙම භාවයට සම්පූර්ණ prediction model එක තවම නොමැත. Foundation-only state."}</p></div></div>
    </section>

    {career?.themes.length?<section className="astro-card mt-5"><p className="eyebrow">Career V1 Themes · Generic Timing Adapter</p><h2 className="serif mt-2 text-2xl text-[#f0e4c8]">වෘත්තීය තේමා සහ වත්මන් timing state</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{career.themes.map(theme=>{const row=timingRows.find(item=>item.theme.code===theme.code);return <div key={theme.code} className="rounded-2xl border border-[#303944] bg-[#081017] p-4"><div className="flex items-center justify-between gap-2"><span className="strength-pill">{theme.level}</span>{row?<TimingBadge status={row.timing.status}/>:null}</div><p className="mt-3 text-sm leading-6 text-[#d2c8b6]">{theme.text_si}</p>{row?<p className="mt-2 text-[11px] leading-5 text-[#89939d]">{timingStatusSi(row.timing.status)}</p>:null}<p className="mt-2 font-mono text-[9px] text-[#66707a]">{theme.code}</p></div>})}</div></section>:null}

    <p className="mt-6 text-center text-[10px] leading-5 text-[#66707a]">Prediction strength = rule-system evidence balance. එය සැබෑ ජීවිත probability ප්‍රතිශතයක් නොවේ.</p>
  </div></main></>;
}
function EvidenceBlock({label,value,sub}:{label:string;value:string;sub:string}){return <div className="rounded-xl border border-[#2c3640] bg-[#081017] p-4"><p className="text-[9px] uppercase tracking-[.14em] text-[#6d7680]">{label}</p><p className="serif mt-1 text-lg text-[#e8d8b7]">{value}</p><p className="mt-2 text-[11px] leading-5 text-[#818a93]">{sub}</p></div>}
function Factor({title,items}:{title:string;items:string[]}){return <div className="rounded-xl border border-[#2c3640] bg-[#081017] p-4"><p className="text-[10px] text-[#cba85d]">{title}</p><div className="mt-2 space-y-1">{items.length?items.map((x,i)=><p key={i} className="text-[11px] leading-5 text-[#929aa3]">• {x}</p>):<p className="text-[11px] text-[#68717a]">වාර්තා වී නැත</p>}</div></div>}

function TimingBadge({status}:{status:"ACTIVE_NOW"|"DASHA_ACTIVE_WAITING_TRIGGER"|"TRANSIT_ONLY"|"DORMANT"|"TIMING_INCOMPLETE"}){
 const label=status==="ACTIVE_NOW"?"ACTIVE NOW":status==="DASHA_ACTIVE_WAITING_TRIGGER"?"DASHA ACTIVE":status==="TRANSIT_ONLY"?"TRANSIT ONLY":status==="DORMANT"?"DORMANT":"INCOMPLETE";
 const cls=status==="ACTIVE_NOW"?"border-[#8f7740] text-[#d8b66b]":status==="TIMING_INCOMPLETE"?"border-[#5a3434] text-[#c98f8f]":"border-[#34475b] text-[#8fa3b5]";
 return <span className={"rounded-full border px-2 py-1 text-[9px] "+cls}>{label}</span>;
}
