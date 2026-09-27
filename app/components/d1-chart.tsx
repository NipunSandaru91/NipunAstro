"use client";

type Graha = Record<string, unknown>;

type D1ChartProps = {
  lagnaRasiId: number;
  grahas: Graha[];
  rashiNames: string[];
  grahaNames: Record<string, string>;
};

const SIGN_GLYPHS=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const PLANET_GLYPHS:Record<string,string>={SURYA:"☉",CHANDRA:"☽",MANGALA:"♂",BUDHA:"☿",GURU:"♃",SHUKRA:"♀",SHANI:"♄",RAHU:"☊",KETU:"☋"};

function pick(obj:Graha|null|undefined,...keys:string[]){if(!obj)return undefined;for(const key of keys){if(obj[key]!==undefined&&obj[key]!==null&&obj[key]!=="")return obj[key]}return undefined}
function codeOf(graha:Graha){return String(pick(graha,"code","graha_code")??"").toUpperCase()}
function grahaName(graha:Graha,names:Record<string,string>){const code=codeOf(graha);return names[code]??String(pick(graha,"name","english_name","code")??"—")}

export default function D1Chart({lagnaRasiId,grahas,rashiNames,grahaNames}:D1ChartProps){
  const grouped=Array.from({length:12},(_,i)=>grahas.filter(g=>Number(pick(g,"rasi_id"))===i+1));
  return (
    <section className="ap-chart-card">
      <div className="ap-chart-stage">
        <svg viewBox="0 0 420 420" role="img" aria-label="D1 Rashi circular chart">
          <defs>
            <radialGradient id="apChartBg"><stop offset="0" stopColor="#132536"/><stop offset=".45" stopColor="#071522"/><stop offset="1" stopColor="#02070b"/></radialGradient>
            <radialGradient id="apMoon"><stop offset="0" stopColor="#dfe6e7"/><stop offset=".7" stopColor="#748392"/><stop offset="1" stopColor="#1b2730"/></radialGradient>
            <filter id="apGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="210" cy="210" r="199" fill="url(#apChartBg)" stroke="#c48a35" strokeWidth="1.6"/>
          <circle cx="210" cy="210" r="168" fill="none" stroke="#31536b" strokeWidth="1"/>
          <circle cx="210" cy="210" r="136" fill="none" stroke="#a8712d" strokeOpacity=".78"/>
          <circle cx="210" cy="210" r="104" fill="none" stroke="#31536b" strokeOpacity=".72"/>
          {Array.from({length:12},(_,i)=>{const a=(i*30-90)*Math.PI/180;return <line key={i} x1="210" y1="210" x2={210+168*Math.cos(a)} y2={210+168*Math.sin(a)} stroke="#355266" strokeOpacity=".42"/>})}
          {SIGN_GLYPHS.map((glyph,i)=>{const a=(i*30-75)*Math.PI/180;return <g key={glyph}><text x={210+184*Math.cos(a)} y={216+184*Math.sin(a)} textAnchor="middle" fill={i+1===lagnaRasiId?"#ffd06b":"#e6a94b"} fontSize="21" fontFamily="Georgia">{glyph}</text><text x={210+149*Math.cos(a)} y={214+149*Math.sin(a)} textAnchor="middle" fill="#aab8c4" fontSize="7">{rashiNames[i]??""}</text></g>})}
          {grouped.flatMap((group,rashiIndex)=>group.map((graha,index)=>{const a=(rashiIndex*30-75+(index-(group.length-1)/2)*6)*Math.PI/180;const code=codeOf(graha);return <g key={code+"-"+index} filter="url(#apGlow)"><circle cx={210+112*Math.cos(a)} cy={210+112*Math.sin(a)} r="12" fill="#07121c" stroke={code==="SURYA"?"#e5a63f":"#7fa2ba"} strokeWidth="1.2"/><text x={210+112*Math.cos(a)} y={215+112*Math.sin(a)} textAnchor="middle" fill={code==="SURYA"?"#ffd36f":"#d9e6ee"} fontSize="14">{PLANET_GLYPHS[code]??"•"}</text></g>}))}
          <circle cx="210" cy="210" r="50" fill="url(#apMoon)" opacity=".92"/>
          <circle cx="197" cy="196" r="8" fill="#53616b" opacity=".6"/>
          <circle cx="226" cy="218" r="10" fill="#52616c" opacity=".45"/>
          <text x="210" y="282" textAnchor="middle" fill="#d7ae5a" fontSize="9" letterSpacing="2">D1 · RĀŚI</text>
        </svg>
      </div>
      <div className="ap-chart-legend">
        {grahas.slice(0,9).map((graha,index)=><span key={index}><i>{PLANET_GLYPHS[codeOf(graha)]??"•"}</i>{grahaName(graha,grahaNames)}</span>)}
      </div>
    </section>
  );
}
