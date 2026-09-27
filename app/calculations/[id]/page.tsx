import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import D1Chart from "@/app/components/d1-chart";
import AppNav from "@/app/components/app-nav";

type PageProps={params:Promise<{id:string}>;searchParams:Promise<{error?:string}>};
type Row=Record<string,unknown>;
type ChartData={calculation?:Row;lagna?:Row|null;grahas?:Row[]};

const RASHI_SI=["මේෂ","වෘෂභ","මිථුන","කටක","සිංහ","කන්‍යා","තුලා","වෘශ්චික","ධනු","මකර","කුම්භ","මීන"];
const NAKSHATRA_SI=["අශ්විනී","භරණී","කෘත්තිකා","රෝහිණී","මෘගශීර්ෂ","ආර්ද්‍රා","පුනර්වසූ","පුෂ්‍ය","ආශ්ලේෂා","මාඝා","පූර්වඵල්ගුණී","උත්තරඵල්ගුණී","හස්ත","චිත්‍රා","ස්වාතී","විශාඛා","අනුරාධා","ජ්‍යේෂ්ඨා","මූල","පූර්වාෂාඪා","උත්තරාෂාඪා","ශ්‍රවණ","ධනිෂ්ඨා","ශතභිෂා","පූර්වභාද්‍රපදා","උත්තරභාද්‍රපදා","රේවතී"];
const GRAHA_SI:Record<string,string>={SURYA:"රවි",CHANDRA:"චන්ද්‍ර",MANGALA:"කුජ",BUDHA:"බුධ",GURU:"ගුරු",SHUKRA:"ශුක්‍ර",SHANI:"ශනි",RAHU:"රාහු",KETU:"කේතු"};
const GRAHA_EN:Record<string,string>={SURYA:"Sun",CHANDRA:"Moon",MANGALA:"Mars",BUDHA:"Mercury",GURU:"Jupiter",SHUKRA:"Venus",SHANI:"Saturn",RAHU:"Rahu",KETU:"Ketu"};
const GRAHA_GLYPH:Record<string,string>={SURYA:"☉",CHANDRA:"☽",MANGALA:"♂",BUDHA:"☿",GURU:"♃",SHUKRA:"♀",SHANI:"♄",RAHU:"☊",KETU:"☋"};

function pick(obj:Row|null|undefined,...keys:string[]){if(!obj)return undefined;for(const key of keys){const v=obj[key];if(v!==undefined&&v!==null&&v!=="")return v}return undefined}
function textValue(value:unknown,fallback="—"){return value===undefined||value===null||value===""?fallback:String(value)}
function rashiName(value:unknown){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=12?RASHI_SI[n-1]:"—"}
function grahaCode(row:Row){return String(pick(row,"code","graha_code")??"").toUpperCase()}
function grahaName(row:Row){const code=grahaCode(row);return GRAHA_SI[code]??textValue(pick(row,"sinhala_name","name","english_name","code"))}
function nakshatra(longitude:unknown){const lon=Number(longitude);if(!Number.isFinite(lon))return "—";const i=Math.floor((((lon%360)+360)%360)/(360/27));return NAKSHATRA_SI[i]}
function houseFor(rasiId:number,lagnaRasiId:number){if(!rasiId||!lagnaRasiId)return 0;return ((rasiId-lagnaRasiId+12)%12)+1}
function degreeLabel(row:Row){const raw=Number(pick(row,"degree_in_rasi","longitude_in_rasi","degree"));return Number.isFinite(raw)?raw.toFixed(2)+"°":"—"}

export default async function CalculationPage({params,searchParams}:PageProps){
  const {id}=await params;
  const {error:engineError}=await searchParams;
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("get_user_calculation_chart_v1",{p_calculation_id:id});
  if(error?.code==="42501"||!data)notFound();
  if(error)throw new Error(error.message);

  const chart=data as ChartData;
  const calculation=chart.calculation??{};
  const lagna=chart.lagna??null;
  const grahas=Array.isArray(chart.grahas)?chart.grahas:[];
  const lagnaRasiId=Number(pick(lagna,"rasi_id"));
  const lagnaLon=pick(lagna,"longitude_sidereal","longitude");
  const moon=grahas.find(g=>grahaCode(g)==="CHANDRA");

  return (
    <>
      <AppNav active="chart"/>
      <main className="ap-app-shell">
        <div className="ap-report-page">
          <header className="ap-page-title ap-report-title">
            <Link href="/dashboard" aria-label="ආපසු">←</Link>
            <div><h1>ජන්ම කේන්දරය (D1)</h1><span>✦</span></div>
          </header>

          {engineError?<div className="ap-error">{decodeURIComponent(engineError)}</div>:null}

          <nav className="ap-report-tabs" aria-label="Chart sections">
            <a className="active" href="#chart">චක්‍රය</a>
            <a href="#positions">පිහිටීම්</a>
            <a href="#rashi">රාශි මණ්ඩලය</a>
            <a href="#graha">ග්‍රහ මණ්ඩලය</a>
          </nav>

          <section id="chart" className="ap-report-section">
            <D1Chart lagnaRasiId={lagnaRasiId} grahas={grahas} rashiNames={RASHI_SI} grahaNames={GRAHA_SI}/>
            <div className="ap-summary-grid">
              <Summary label="ලග්නය" value={rashiName(lagnaRasiId)} sub={textValue(pick(lagna,"degree_in_rasi","degree"))+"°"}/>
              <Summary label="චන්ද්‍ර රාශිය" value={rashiName(pick(moon,"rasi_id"))} sub={degreeLabel(moon??{})}/>
              <Summary label="නක්ෂත්‍රය" value={nakshatra(pick(moon,"longitude_sidereal","longitude"))} sub={"Lagna · "+nakshatra(lagnaLon)}/>
            </div>
          </section>

          <section id="positions" className="ap-report-section">
            <div className="ap-section-head"><div><small>ග්‍රහ පිහිටීම්</small><h2>ග්‍රහ පිහිටීම</h2></div><span>D1</span></div>
            <div className="ap-graha-table">
              <div className="head"><span>ග්‍රහයා</span><span>රාශිය</span><span>අංශක</span><span>භාවය</span></div>
              {grahas.map((g,index)=>{
                const code=grahaCode(g);const rasiId=Number(pick(g,"rasi_id"));
                return <div className="row" key={code||index}>
                  <span className="planet"><i>{GRAHA_GLYPH[code]??"•"}</i><b>{grahaName(g)}</b></span>
                  <span>{rashiName(rasiId)}</span>
                  <span>{degreeLabel(g)}</span>
                  <span>{houseFor(rasiId,lagnaRasiId)||"—"}</span>
                </div>
              })}
            </div>
          </section>

          <section id="rashi" className="ap-report-section">
            <div className="ap-section-head"><div><small>රාශි 12</small><h2>රාශි මණ්ඩලය</h2></div><span>Sidereal</span></div>
            <D1Chart lagnaRasiId={lagnaRasiId} grahas={grahas} rashiNames={RASHI_SI} grahaNames={GRAHA_SI}/>
          </section>

          <section id="graha" className="ap-report-section">
            <div className="ap-section-head"><div><small>සූර්ය කේන්ද්‍රීය දෘශ්‍යකරණය</small><h2>ග්‍රහ මණ්ඩලය</h2></div><span>Visual</span></div>
            <GrahaMandala grahas={grahas}/>
            <div className="ap-graha-list">
              {grahas.map((g,index)=>{const code=grahaCode(g);return <div key={code||index}><span><i>{GRAHA_GLYPH[code]??"•"}</i><b>{grahaName(g)}</b><small>{GRAHA_EN[code]??code}</small></span><em>{rashiName(pick(g,"rasi_id"))} · {degreeLabel(g)}</em></div>})}
            </div>
          </section>

          <section className="ap-report-actions">
            <Link href={"/calculations/"+id+"/dasha"} className="ap-primary-button">විංශෝත්තරී දශා <span>→</span></Link>
            <Link href={"/calculations/"+id+"/transit"} className="ap-outline-button">ගෝචර විශ්ලේෂණය</Link>
          </section>

          <p className="ap-form-footnote">{textValue(pick(calculation,"ayanamsa"),"Lahiri")} · {textValue(pick(calculation,"house_system"),"Whole Sign")} · Calculation layer</p>
        </div>
      </main>
    </>
  );
}

function Summary({label,value,sub}:{label:string;value:string;sub:string}){return <div className="ap-summary-card"><small>{label}</small><b>{value}</b><span>{sub}</span></div>}

function GrahaMandala({grahas}:{grahas:Row[]}){
  return (
    <div className="ap-orbit-panel">
      <svg viewBox="0 0 360 360" role="img" aria-label="Graha orbital mandala">
        <defs><radialGradient id="sun"><stop offset="0" stopColor="#fff2b2"/><stop offset=".28" stopColor="#ffc653"/><stop offset="1" stopColor="#b25c17"/></radialGradient></defs>
        <circle cx="180" cy="180" r="25" fill="url(#sun)"/>
        {grahas.filter(g=>grahaCode(g)!=="SURYA").slice(0,8).map((g,index)=>{
          const radius=46+index*16;
          const lon=Number(pick(g,"longitude_sidereal","longitude"));
          const fallback=Number(pick(g,"rasi_id"))*30-15;
          const angle=((Number.isFinite(lon)?lon:fallback)-90)*Math.PI/180;
          const x=180+radius*Math.cos(angle);const y=180+radius*Math.sin(angle);const code=grahaCode(g);
          return <g key={code||index}><circle cx="180" cy="180" r={radius} fill="none" stroke={index%2===0?"#9a6d30":"#31546d"} strokeOpacity=".45"/><circle cx={x} cy={y} r={7+Math.min(index,3)} fill="#0a151e" stroke={code==="CHANDRA"?"#dfe8ef":"#d3a04e"} strokeWidth="1.5"/><text x={x} y={y+4} textAnchor="middle" fill="#f2d68e" fontSize="10">{GRAHA_GLYPH[code]??"•"}</text></g>
        })}
      </svg>
    </div>
  );
}
