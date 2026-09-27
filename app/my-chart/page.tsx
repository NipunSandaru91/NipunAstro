import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

type Calculation={id:string;input_birth_date:string;input_birth_time:string;input_timezone:string;input_place_name:string|null;input_country:string|null;calculation_timestamp:string;status:string;engine_version:string;ayanamsa:string|null;zodiac_type:string|null;house_system:string|null};

export default async function MyChartPage(){
 const supabase=await createClient();
 const {data,error}=await supabase.from("user_calculation_runs_v1").select("*").order("calculation_timestamp",{ascending:false});
 const calculations=(data??[]) as Calculation[];
 return <><AppNav active="chart"/><main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl">
  <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-8"><p className="eyebrow">Chart Observatory</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="serif text-4xl text-[#f3dfb1]">මගේ හදහන්</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#aeb5bd]">ඔබගේ සත්‍යාපිත ජන්ම ගණනය කිරීම් සහ chart history එක මෙහි පවත්වා ගනී.</p></div><Link href="/chart/new" className="cosmic-primary">＋ නව හදහන</Link></div></section>
  {error?<section className="astro-card mt-5"><p className="text-sm text-[#d8aaaa]">හදහන් ඉතිහාසය ලබාගත නොහැක.</p></section>:calculations.length===0?<section className="astro-card mt-5 text-center"><p className="eyebrow">No chart yet</p><h2 className="serif mt-2 text-2xl text-[#f0e4c8]">ඔබේ පළමු ජන්ම හදහන සාදන්න</h2><p className="mt-3 text-sm text-[#929aa3]">උපන් දිනය, වේලාව සහ ස්ථානය ඇතුළත් කර deterministic calculation එකක් සුරකින්න.</p><Link href="/chart/new" className="cosmic-primary mt-6">හදහන සාදන්න</Link></section>:<section className="mt-5 grid gap-4 md:grid-cols-2">{calculations.map((chart,index)=><article key={chart.id} className="astro-card"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.15em] text-[#717983]">Chart {calculations.length-index}</p><h2 className="serif mt-1 text-2xl text-[#f0e4c8]">{chart.input_place_name??"Natal chart"}</h2><p className="mt-1 text-xs text-[#727b84]">{chart.input_birth_date} · {chart.input_birth_time} · {chart.input_timezone}</p></div><span className="strength-pill">{chart.status}</span></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label="රට" value={chart.input_country??"—"}/><Info label="Zodiac" value={chart.zodiac_type??"—"}/><Info label="Ayanāṃśa" value={chart.ayanamsa??"—"}/><Info label="Engine" value={chart.engine_version??"—"}/></div><Link href={`/calculations/${chart.id}`} className="cosmic-secondary mt-5">ගණනය විවෘත කරන්න</Link></article>)}</section>}
 </div></main></>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-[#29323b] bg-[#091016] p-3"><p className="text-[9px] uppercase tracking-[.12em] text-[#68717b]">{label}</p><p className="mt-1 break-words text-xs text-[#c9c4b9]">{value}</p></div>}
