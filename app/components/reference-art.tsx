export function CosmicSageArt(){
  const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const chakra=["#e3bd58","#e87840","#e5ad42","#50a6c4","#48a7c9","#9b6ac0","#e1bd58"];
  return <svg viewBox="0 0 390 560" className="reference-art" role="img" aria-label="Meditating sage with zodiac and chakra diagram">
    <defs>
      <radialGradient id="sageGlow" cx="50%" cy="43%" r="46%"><stop offset="0" stopColor="#f0a63b" stopOpacity=".54"/><stop offset=".25" stopColor="#b36a28" stopOpacity=".18"/><stop offset="1" stopColor="#061017" stopOpacity="0"/></radialGradient>
      <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06131c"/><stop offset=".55" stopColor="#07141b"/><stop offset="1" stopColor="#07090b"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="390" height="560" fill="url(#night)"/>
    <circle cx="205" cy="240" r="155" fill="url(#sageGlow)"/>
    {[30,72,118,164,210,256,302,348].map((x,i)=><circle key={i} cx={x} cy={50+(i%4)*74} r="1.2" fill={i%2?"#6fa0bd":"#d7b361"} opacity=".7"/>)}
    <circle cx="205" cy="228" r="164" fill="none" stroke="#9f7637" strokeOpacity=".74"/>
    <circle cx="205" cy="228" r="135" fill="none" stroke="#385e75" strokeOpacity=".7"/>
    <circle cx="205" cy="228" r="104" fill="none" stroke="#a17536" strokeOpacity=".45"/>
    <circle cx="205" cy="228" r="72" fill="none" stroke="#31536a" strokeOpacity=".62"/>
    {signs.map((s,i)=>{const a=(-90+i*30)*Math.PI/180;return <text key={s} x={205+145*Math.cos(a)} y={232+145*Math.sin(a)} textAnchor="middle" fill="#d2a34f" fontSize="14">{s}</text>})}
    <line x1="205" y1="38" x2="205" y2="365" stroke="#c89b4f" strokeOpacity=".72"/>
    {chakra.map((c,i)=><g key={c} filter="url(#glow)"><circle cx="205" cy={72+i*42} r={i===0?12:10} fill={c}/><circle cx="205" cy={72+i*42} r={i===0?17:15} fill="none" stroke={c} strokeOpacity=".3"/></g>)}
    <g transform="translate(43 244)">
      <path d="M98 28c18 2 30 17 30 35 0 14-6 23-14 31 30 22 46 61 43 117l-7 97H23l-8-94c-4-50 11-91 39-118-7-9-11-20-10-32 2-22 21-38 42-36z" fill="#100b0a"/>
      <path d="M63 58c9-24 46-27 60-5-3-18-11-28-25-36-7-10-17-15-27-17 6 10 6 16 2 23-8 10-11 20-10 35z" fill="#1e110d"/>
      <path d="M62 92c9 7 19 10 29 10s20-3 29-10c-2 19-10 31-29 36-18-4-28-16-29-36z" fill="#3a2116"/>
      <path d="M44 164c28-23 65-23 94 0 18 15 30 43 31 74H13c2-31 13-58 31-74z" fill="#130d0b"/>
      <text x="92" y="189" textAnchor="middle" fill="#cf8f39" fontSize="28">ॐ</text>
    </g>
    <g transform="translate(284 404)" opacity=".9"><path d="M0 74h80L68 28H57L40 0 23 28H12z" fill="#0c0b0a"/><rect x="30" y="45" width="20" height="29" fill="#050607"/></g>
    <rect y="500" width="390" height="60" fill="url(#night)" opacity=".9"/>
  </svg>;
}

export function CosmicHorizonArt(){
 const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
 return <svg viewBox="0 0 390 500" className="reference-art" role="img" aria-label="Cosmic horizon and zodiac wheel">
  <defs><radialGradient id="hGlow" cx="50%" cy="88%" r="46%"><stop offset="0" stopColor="#ffd18a"/><stop offset=".08" stopColor="#d98d31"/><stop offset=".18" stopColor="#1b4053"/><stop offset="1" stopColor="#041019"/></radialGradient></defs>
  <rect width="390" height="500" fill="#041019"/>
  {[24,82,141,218,274,335].map((x,i)=><circle key={i} cx={x} cy={62+(i%3)*88} r="1.2" fill={i%2?"#d2a24f":"#729bb3"} opacity=".75"/>)}
  <circle cx="195" cy="410" r="250" fill="url(#hGlow)"/>
  <circle cx="195" cy="323" r="156" fill="none" stroke="#a77a37" strokeOpacity=".76"/>
  <circle cx="195" cy="323" r="126" fill="none" stroke="#a77a37" strokeOpacity=".46"/>
  <circle cx="195" cy="323" r="88" fill="none" stroke="#3c6278" strokeOpacity=".76"/>
  {signs.map((s,i)=>{const a=(-155+i*28)*Math.PI/180;return <text key={s} x={195+150*Math.cos(a)} y={320+150*Math.sin(a)} textAnchor="middle" fill="#d0a14c" fontSize="13">{s}</text>})}
  <path d="M0 406 Q195 340 390 406V500H0z" fill="#020608"/>
  <circle cx="195" cy="399" r="13" fill="#f5bb5c" filter="url(#glow)"/>
 </svg>;
}

export function SacredMarkArt(){
 return <svg viewBox="0 0 220 220" className="sacred-svg" role="img" aria-label="Sacred geometric star">
  <defs><radialGradient id="mGlow"><stop offset="0" stopColor="#f7c356" stopOpacity=".72"/><stop offset="1" stopColor="#061019" stopOpacity="0"/></radialGradient></defs>
  <circle cx="110" cy="110" r="92" fill="url(#mGlow)" opacity=".16"/>
  <rect x="43" y="43" width="134" height="134" fill="none" stroke="#a77b38" strokeWidth="1.5" transform="rotate(45 110 110)"/>
  <rect x="68" y="68" width="84" height="84" fill="none" stroke="#3c6075" strokeWidth="1.4" transform="rotate(45 110 110)"/>
  <path d="M110 63l12 35 35 12-35 12-12 35-12-35-35-12 35-12z" fill="none" stroke="#c9943f" strokeWidth="1.6"/>
  <circle cx="110" cy="110" r="19" fill="#d99a3d" opacity=".24"/>
  <path d="M110 87l7 16 16 7-16 7-7 16-7-16-16-7 16-7z" fill="#f4bb4d"/>
 </svg>;
}
