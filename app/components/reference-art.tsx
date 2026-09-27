export function CosmicSageArt(){
  const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const chakra=["#f4c75f","#eb7840","#efad42","#56b6d6","#5ab7d7","#aa72d0","#f4c75f"];
  return <svg viewBox="0 0 430 690" className="reference-art" role="img" aria-label="Meditating sage beneath a zodiac and chakra mandala">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#02080d"/><stop offset=".42" stopColor="#071620"/><stop offset=".72" stopColor="#13212a"/><stop offset="1" stopColor="#06090c"/></linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="43%" r="45%"><stop offset="0" stopColor="#ffd079" stopOpacity=".98"/><stop offset=".08" stopColor="#f1a13a" stopOpacity=".82"/><stop offset=".2" stopColor="#9a5424" stopOpacity=".34"/><stop offset=".48" stopColor="#16354a" stopOpacity=".14"/><stop offset="1" stopColor="#061017" stopOpacity="0"/></radialGradient>
      <radialGradient id="sageWarm" cx="45%" cy="36%" r="64%"><stop offset="0" stopColor="#7a3d1f"/><stop offset=".26" stopColor="#3c2117"/><stop offset=".7" stopColor="#140d0a"/><stop offset="1" stopColor="#090706"/></radialGradient>
      <linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5c2915"/><stop offset=".5" stopColor="#25120d"/><stop offset="1" stopColor="#0e0908"/></linearGradient>
      <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#223743"/><stop offset="1" stopColor="#080b0e"/></linearGradient>
      <filter id="softGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="smallGlow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity=".72"/></filter>
      <clipPath id="orbClip"><circle cx="238" cy="248" r="184"/></clipPath>
    </defs>

    <rect width="430" height="690" fill="url(#sky)"/>
    <circle cx="238" cy="246" r="196" fill="url(#sunGlow)" opacity=".95"/>

    <g opacity=".8">
      {[[28,44],[77,96],[120,38],[172,78],[252,42],[319,87],[382,50],[405,126],[34,168],[91,202],[360,190],[395,258],[47,298],[334,315]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%4===0?1.5:1} fill={i%3===0?"#dfb25e":"#79a8c4"}/>)}
    </g>

    <g clipPath="url(#orbClip)">
      <circle cx="238" cy="248" r="178" fill="none" stroke="#c99a4d" strokeOpacity=".72" strokeWidth="1.2"/>
      <circle cx="238" cy="248" r="149" fill="none" stroke="#5f8ca6" strokeOpacity=".6"/>
      <circle cx="238" cy="248" r="121" fill="none" stroke="#c99a4d" strokeOpacity=".38"/>
      <circle cx="238" cy="248" r="91" fill="none" stroke="#5f8ca6" strokeOpacity=".38"/>
      <circle cx="238" cy="248" r="62" fill="none" stroke="#c99a4d" strokeOpacity=".28"/>
      {Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;return <line key={i} x1={238+70*Math.cos(a)} y1={248+70*Math.sin(a)} x2={238+174*Math.cos(a)} y2={248+174*Math.sin(a)} stroke={i%2?"#385f75":"#8f6c35"} strokeOpacity=".2"/>})}
      {signs.map((s,i)=>{const a=(-90+i*30)*Math.PI/180;return <text key={s} x={238+160*Math.cos(a)} y={253+160*Math.sin(a)} textAnchor="middle" fill="#d2a653" fontSize="15" fontFamily="Georgia">{s}</text>})}
    </g>

    <line x1="238" y1="22" x2="238" y2="400" stroke="#d8ad5a" strokeOpacity=".65"/>
    {chakra.map((c,i)=>{const y=70+i*43;const r=i===3?16:12;return <g key={c} filter="url(#smallGlow)"><circle cx="238" cy={y} r={r+7} fill={c} opacity=".12"/><circle cx="238" cy={y} r={r} fill={c}/><circle cx="238" cy={y} r={r+2} fill="none" stroke="#fff" strokeOpacity=".28"/></g>})}

    <path d="M0 485 L72 413 126 449 180 382 244 445 301 399 430 484V690H0Z" fill="url(#mountain)" opacity=".92"/>
    <path d="M0 530 Q85 480 158 520 T300 515 T430 520V690H0Z" fill="#090b0d" opacity=".95"/>

    <g transform="translate(27 252)" filter="url(#shadow)">
      <ellipse cx="127" cy="281" rx="120" ry="24" fill="#050505" opacity=".78"/>
      <path d="M93 61c6-26 26-45 51-45 19 0 36 12 46 29-4-18-15-32-32-43 8-5 11-12 11-22-14 8-27 8-39 2-13 5-26 16-33 30-4 9-5 22-4 49z" fill="#17100d"/>
      <ellipse cx="142" cy="71" rx="40" ry="47" fill="url(#sageWarm)"/>
      <path d="M114 68c8-8 17-12 27-12 10 0 19 4 27 12-5-14-13-23-27-27-13 4-22 13-27 27z" fill="#0c0908"/>
      <path d="M113 79c5 11 15 18 29 21 14-3 24-10 30-21-1 30-12 52-30 66-18-13-28-35-29-66z" fill="#6c4329"/>
      <path d="M108 89c7 29 18 52 34 69 14-14 26-39 35-72-2 40-13 76-35 103-23-28-34-62-34-100z" fill="#d6b08a" opacity=".9"/>
      <path d="M79 142c19-22 43-34 70-34 31 0 57 15 74 41 13 21 20 52 19 91l-6 80H49l-6-77c-3-42 9-77 36-101z" fill="url(#robe)"/>
      <path d="M65 190c25 25 46 38 77 42 30-4 51-17 78-43-7 42-31 72-77 83-47-11-71-40-78-82z" fill="#28130e" opacity=".92"/>
      <path d="M65 241c-21 16-33 36-36 62 33-16 66-23 99-22-21-12-42-25-63-40z" fill="#170d0a"/>
      <path d="M216 241c22 16 34 37 37 63-32-16-65-23-100-23 20-13 41-26 63-40z" fill="#170d0a"/>
      <path d="M76 291c19-15 40-22 64-22 24 0 45 7 64 22-15 18-36 28-64 28-27 0-49-10-64-28z" fill="#0d0908"/>
      <path d="M105 160c13 7 25 11 37 11 12 0 24-4 37-11" fill="none" stroke="#c38a3c" strokeWidth="2" strokeOpacity=".52"/>
      <path d="M98 175c7 11 16 20 26 28M186 175c-7 11-16 20-26 28" stroke="#be7d32" strokeWidth="2" strokeOpacity=".4"/>
      <g opacity=".8">{Array.from({length:13},(_,i)=><circle key={i} cx={104+i*6} cy={163+i%2*3} r="2" fill="#d0a04c"/>)}</g>
    </g>

    <g transform="translate(322 412)" opacity=".95">
      <path d="M0 74h88L75 34H62L44 2 26 34H13z" fill="#0a0908"/>
      <rect x="31" y="45" width="26" height="29" fill="#050607"/>
      <path d="M18 37h52M27 28h34" stroke="#b57b33" strokeOpacity=".55"/>
      <circle cx="44" cy="48" r="4" fill="#e0a44a" filter="url(#smallGlow)"/>
    </g>

    <rect y="550" width="430" height="140" fill="url(#sky)" opacity=".84"/>
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
  <circle cx="195" cy="399" r="13" fill="#f5bb5c"/>
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
