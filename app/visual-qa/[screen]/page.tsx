import Link from "next/link";
import { notFound } from "next/navigation";
import D1Chart from "@/app/components/d1-chart";

const RASHI=["මේෂ","වෘෂභ","මිථුන","කටක","සිංහ","කන්‍යා","තුලා","වෘශ්චික","ධනු","මකර","කුම්භ","මීන"];
const GRAHA_NAMES:Record<string,string>={SURYA:"රවි",CHANDRA:"චන්ද්‍ර",MANGALA:"කුජ",BUDHA:"බුධ",GURU:"ගුරු",SHUKRA:"ශුක්‍ර",SHANI:"ශනි",RAHU:"රාහු",KETU:"කේතු"};
const GLYPH:Record<string,string>={SURYA:"☉",CHANDRA:"☽",MANGALA:"♂",BUDHA:"☿",GURU:"♃",SHUKRA:"♀",SHANI:"♄",RAHU:"☊",KETU:"☋"};
const grahas=[
  {code:"SURYA",rasi_id:12,degree_in_rasi:22.19,longitude_sidereal:352.19},
  {code:"CHANDRA",rasi_id:9,degree_in_rasi:12.21,longitude_sidereal:252.21},
  {code:"MANGALA",rasi_id:3,degree_in_rasi:8.02,longitude_sidereal:68.02},
  {code:"BUDHA",rasi_id:1,degree_in_rasi:5.08,longitude_sidereal:5.08},
  {code:"GURU",rasi_id:4,degree_in_rasi:9.53,longitude_sidereal:99.53},
  {code:"SHUKRA",rasi_id:1,degree_in_rasi:18.26,longitude_sidereal:18.26},
  {code:"SHANI",rasi_id:10,degree_in_rasi:16.11,longitude_sidereal:286.11},
  {code:"RAHU",rasi_id:10,degree_in_rasi:14.37,longitude_sidereal:284.37},
  {code:"KETU",rasi_id:4,degree_in_rasi:14.37,longitude_sidereal:104.37},
];
const lagna=4;

function Frame({children,active="dashboard"}:{children:React.ReactNode;active?:string}){
  return <main className="ap-app-shell"><header className="ap-app-header"><div className="ap-app-header-inner"><div className="ap-user-block"><span className="ap-avatar">N</span><span><b>Nipun</b><small>සුබ දවසක්!</small></span></div><span className="ap-bell">♧</span></div></header>{children}<nav className="ap-bottom-nav"><a className={active==="dashboard"?"active":""}><span>⌂</span><small>මුල් පිටුව</small></a><a className={active==="chart"?"active":""}><span>⌬</span><small>හදහන</small></a><a><span>▤</span><small>දැනුම</small></a><a><span>✣</span><small>පුරෝකථන</small></a><a><span>•••</span><small>තවත්</small></a></nav></main>
}

function PageTitle({title}:{title:string}){return <header className="ap-page-title ap-report-title"><span style={{color:"#ddae5e"}}>←</span><div><h1>{title}</h1><span>✦</span></div></header>}

function Tabs({active}:{active:string}){return <nav className="ap-report-tabs"><a className={active==="chart"?"active":""}>චක්‍රය</a><a className={active==="positions"?"active":""}>පිහිටීම්</a><a className={active==="rashi"?"active":""}>රාශි</a><a className={active==="graha"?"active":""}>ග්‍රහ</a></nav>}

function GrahaTable(){
  return <div className="ap-graha-table"><div className="head"><span>ග්‍රහයා</span><span>රාශිය</span><span>අංශක</span><span>භාවය</span></div>{grahas.map((g,index)=><div className="row" key={g.code}><span className="planet"><i>{GLYPH[g.code]}</i><b>{GRAHA_NAMES[g.code]}</b></span><span>{RASHI[g.rasi_id-1]}</span><span>{g.degree_in_rasi.toFixed(2)}°</span><span>{((g.rasi_id-lagna+12)%12)+1}</span></div>)}</div>
}

function Orbit(){
  return <div className="ap-orbit-panel"><svg viewBox="0 0 360 360"><defs><radialGradient id="sun2"><stop offset="0" stopColor="#fff7c0"/><stop offset=".3" stopColor="#ffd15b"/><stop offset="1" stopColor="#8f4518"/></radialGradient></defs><circle cx="180" cy="180" r="28" fill="url(#sun2)"/>{grahas.filter(g=>g.code!=="SURYA").slice(0,8).map((g,index)=>{const radius=50+index*17;const a=(g.longitude_sidereal-90)*Math.PI/180;const x=180+radius*Math.cos(a),y=180+radius*Math.sin(a);return <g key={g.code}><circle cx="180" cy="180" r={radius} fill="none" stroke={index%2?"#315873":"#a87834"} strokeOpacity=".5"/><circle cx={x} cy={y} r={7+Math.min(index,4)} fill="#08131c" stroke="#d3a04e"/><text x={x} y={y+4} textAnchor="middle" fill="#f2d68e" fontSize="10">{GLYPH[g.code]}</text></g>})}</svg></div>
}

export default async function VisualQaScreen({params}:{params:Promise<{screen:string}>}){
  if(process.env.VISUAL_QA_MODE!=="1")notFound();
  const {screen}=await params;

  if(screen==="dashboard")return <Frame><div className="ap-app-main"><section className="ap-dashboard-hero"><div className="ap-dashboard-copy"><p>ඔබේ ජන්ම හදහන</p><h1>විස්තර බලන්න</h1><span>Colombo · 1991-04-06</span></div><div className="ap-mini-cosmos"><i/><i/><i/><b>☉</b></div><span className="ap-round-arrow">→</span></section><section className="ap-feature-grid">{[["☼","ජන්ම හදහන"],["♄","දශා විශ්ලේෂණය"],["▥","ගෝචර"],["▤","හදහන් ඉතිහාසය"],["◇","පුරෝකථන"],["✦","මගේ පැතිකඩ"]].map(([icon,label])=><div className="ap-feature-tile" key={label}><span>{icon}</span><b>{label}</b></div>)}</section><section className="ap-dashboard-banner"><div><small>දෛනික ජ්‍යෝතිෂ දැනුම</small><h2>ග්‍රහ පිහිටීම් සහ කාල රටා පැහැදිලිව බලන්න</h2></div><span className="ap-round-arrow">→</span></section></div></Frame>;

  if(screen==="new-chart")return <Frame active="chart"><div className="ap-form-page"><PageTitle title="ජන්ම විස්තර"/><section className="ap-stepper"><div className="active"><b>1</b><span>විස්තර</span></div><i/><div><b>2</b><span>කාලය/ස්ථානය</span></div><i/><div><b>3</b><span>තහවුරු</span></div></section><div className="ap-form-card"><label className="ap-field"><span>උපන් දිනය</span><input value="1991-04-06" readOnly/></label><label className="ap-field"><span>උපන් වේලාව</span><input value="14:12" readOnly/></label><label className="ap-field"><span>රට</span><input value="Sri Lanka" readOnly/></label><label className="ap-field"><span>නගරය</span><input value="Colombo" readOnly/></label><div className="ap-primary-button">ඉදිරියට <span>→</span></div></div></div></Frame>;

  if(screen==="d1")return <Frame active="chart"><div className="ap-report-page"><PageTitle title="ජන්ම කේන්දරය (D1)"/><Tabs active="chart"/><D1Chart lagnaRasiId={lagna} grahas={grahas} rashiNames={RASHI} grahaNames={GRAHA_NAMES}/><div className="ap-summary-grid"><div className="ap-summary-card"><small>ලග්නය</small><b>කටක</b><span>09.53°</span></div><div className="ap-summary-card"><small>චන්ද්‍ර රාශිය</small><b>ධනු</b><span>12.21°</span></div><div className="ap-summary-card"><small>නවාංශය</small><b>D9</b><span>වෘශ්චික</span></div></div></div></Frame>;

  if(screen==="positions")return <Frame active="chart"><div className="ap-report-page"><PageTitle title="ග්‍රහ පිහිටීම්"/><Tabs active="positions"/><div className="ap-section-head"><div><small>D1 · සත්‍යාපිත දත්ත</small><h2>ග්‍රහ පිහිටීම</h2></div><span>9 ග්‍රහ</span></div><GrahaTable/></div></Frame>;

  if(screen==="rashi")return <Frame active="chart"><div className="ap-report-page"><PageTitle title="රාශි මණ්ඩලය"/><Tabs active="rashi"/><D1Chart lagnaRasiId={lagna} grahas={grahas} rashiNames={RASHI} grahaNames={GRAHA_NAMES}/><div className="ap-rashi-grid">{RASHI.map((name,i)=><div className={i+1===lagna?"active":""} key={name}><span>{["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"][i]}</span><b>{name}</b><small>{grahas.filter(g=>g.rasi_id===i+1).map(g=>GRAHA_NAMES[g.code]).join(" · ")||"—"}</small></div>)}</div></div></Frame>;

  if(screen==="graha")return <Frame active="chart"><div className="ap-report-page"><PageTitle title="ග්‍රහ මණ්ඩලය"/><Tabs active="graha"/><Orbit/><div className="ap-graha-list">{grahas.map(g=><div key={g.code}><span><i>{GLYPH[g.code]}</i><b>{GRAHA_NAMES[g.code]}</b><small>{g.code}</small></span><em>{RASHI[g.rasi_id-1]} · {g.degree_in_rasi.toFixed(2)}°</em></div>)}</div></div></Frame>;

  if(screen==="dasha")return <Frame active="chart"><div className="ap-dasha-page"><PageTitle title="විංශෝත්තරී දශා"/><nav className="ap-report-tabs ap-two-tabs"><a className="active">දශා කාලසටහන</a><a>විස්තර</a></nav><section className="ap-current-dasha"><div className="ap-current-planet"><span>☽</span></div><div><small>වත්මන් දශාව</small><h2>චන්ද්‍ර මහා දශා</h2><p>2019-08-12 <span>→</span> 2029-08-12</p></div></section><section className="ap-dasha-timeline">{[[2,"2019","2029"],[3,"2029","2036"],[8,"2036","2054"],[5,"2054","2070"],[7,"2070","2089"],[4,"2089","2106"]].map(([id,start,end],i)=><article className={i===0?"active":""} key={id}><div className="ap-timeline-dot">{GLYPH[Object.keys(GRAHA_NAMES)[Number(id)-1]]}</div><div className="ap-timeline-card"><div><b>{Object.values(GRAHA_NAMES)[Number(id)-1]}</b>{i===0?<span>වත්මන්</span>:null}</div><p>{start} – {end}</p><small>මහාදශා</small></div><span className="ap-timeline-arrow">›</span></article>)}</section></div></Frame>;

  notFound();
}
