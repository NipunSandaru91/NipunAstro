import Link from "next/link";
import AppNav from "@/app/components/app-nav";
import D1Chart from "@/app/components/d1-chart";
import ChartNameEditor from "@/app/components/chart-name-editor";
import DeleteChartButton from "@/app/components/delete-chart-button";
import { buildPersonalBhavaCards } from "@/lib/prediction/ui/personal-bhava";

type Props = {
  calculationId: string;
  subjectName: string | null;
  lagnaRasiId: number;
  lagnaDegree?: unknown;
  grahas: Array<Record<string, unknown>>;
  shadbala: Array<Record<string, unknown>>;
  saved?: string;
};

const RASHI_SI=["මේෂ","වෘෂභ","මිථුන","කටක","සිංහ","කන්‍යා","තුලා","වෘශ්චික","ධනු","මකර","කුම්භ","මීන"];
const GRAHA_SI:Record<string,string>={SURYA:"රවි",CHANDRA:"චන්ද්‍ර",MANGALA:"කුජ",BUDHA:"බුධ",GURU:"ගුරු",SHUKRA:"ශුක්‍ර",SHANI:"ශනි",RAHU:"රාහු",KETU:"කේතු"};

function pick(obj:Record<string,unknown>|null|undefined,...keys:string[]){
  if(!obj)return undefined;
  for(const key of keys)if(obj[key]!==undefined&&obj[key]!==null&&obj[key]!=="")return obj[key];
}
function num(value:unknown){const n=Number(value);return Number.isFinite(n)?n:undefined}

export default function PersonalChartView(props:Props){
  const positions=props.grahas.map(g=>({graha_id:num(pick(g,"graha_id")),rasi_id:num(pick(g,"rasi_id"))}))
    .filter((x):x is {graha_id:number;rasi_id:number}=>Boolean(x.graha_id&&x.rasi_id));
  const shadbala=props.shadbala.map(s=>{
    const graha_id=num(pick(s,"graha_id"));
    const direct=num(pick(s,"total_bala_rupa"));
    const total=num(pick(s,"total_bala"));
    return graha_id?{graha_id,total_bala_rupa:direct??(total!==undefined?total/60:0)}:null;
  }).filter((x):x is {graha_id:number;total_bala_rupa:number}=>x!==null);

  const cards=buildPersonalBhavaCards({lagnaRasiId:props.lagnaRasiId,positions,shadbala});

  return <>
    <AppNav active="chart"/>
    <main className="astro-shell min-h-screen px-4 py-6 pb-28 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="personal-chart-hero">
          <div>
            <p className="eyebrow">Personal · D1 Reading</p>
            <h1 className="serif mt-2 text-4xl text-[#176b4a]">{props.subjectName||"උපන් කේන්දරය"}</h1>
            <ChartNameEditor calculationId={props.calculationId} initialName={props.subjectName??""}/>
            {props.saved?<p className="mt-2 text-xs text-[#176b4a]">නම යාවත්කාලීන කර ඇත.</p>:null}
          </div>
          <div className="personal-lagna-badge">
            <small>ලග්නය</small>
            <b>{RASHI_SI[props.lagnaRasiId-1]}</b>
            <span>{props.lagnaDegree===undefined?"":String(props.lagnaDegree)+"°"}</span>
          </div>
        </header>

        <section className="personal-d1-card mt-5">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Simple D1</p><h2 className="serif mt-1 text-2xl text-[#18372a]">රාශි සටහන</h2></div>
            <span className="personal-mode-chip">PERSONAL</span>
          </div>
          <div className="mt-5">
            <D1Chart lagnaRasiId={props.lagnaRasiId} grahas={props.grahas} rashiNames={RASHI_SI} grahaNames={GRAHA_SI}/>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#566c5e]">මෙහි පෙන්වන්නේ ඔබේ D1 රාශි සටහන සහ කියවීමට අවශ්‍ය මූලික තොරතුරු පමණි. Technical evidence පසුබිමේ ගණනය කරයි.</p>
        </section>

        <section className="mt-8">
          <div className="px-1">
            <p className="eyebrow">Life Areas · භාව 12</p>
            <h2 className="serif mt-2 text-3xl text-[#18372a]">ඔබේ ජීවිත ක්ෂේත්‍ර 12</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#566c5e]">එක් එක් භාවයට අදාළ රාශිය, ග්‍රහ පිහිටීම්, භාව අධිපති සම්බන්ධතා සහ strength factors එකට ගෙන සරල කියවීමක් ලෙස මෙහි සාරාංශ කර ඇත.</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {cards.map(card=><article key={card.bhava} className="personal-bhava-card">
              <div className="personal-bhava-head">
                <span className="personal-bhava-number">{String(card.bhava).padStart(2,"0")}</span>
                <div>
                  <p>භාව {card.bhava} · {card.rasi_name_si}</p>
                  <h3>{card.title_si}</h3>
                </div>
              </div>

              <div className="personal-keywords">{card.keywords_si.map(k=><span key={k}>{k}</span>)}</div>
              <p className="personal-bhava-copy">{card.description_si}</p>

              <div className="personal-theme">
                <small>ප්‍රධාන තේමාව</small>
                <b>{card.main_theme_si}</b>
              </div>
            </article>)}
          </div>
        </section>

        <section className="mt-7 flex flex-wrap gap-3">
          <Link href="/my-chart" className="cosmic-secondary">මගේ කේන්දර</Link>
          <Link href="/chart/new" className="cosmic-primary">නව කේන්දරයක්</Link>
          <DeleteChartButton calculationId={props.calculationId} label="කේන්දරය මකන්න"/>
        </section>

        <p className="mt-6 text-[10px] leading-5 text-[#566c5e]">මෙම විස්තර සාම්ප්‍රදායික ජ්‍යෝතිෂ අර්ථකථන සඳහා වන අතර නියත අනාගත ප්‍රකාශයක් ලෙස නොසලකන්න.</p>
      </div>
    </main>
  </>;
}
