export function CosmicSageArt(){
  const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const planets=[
    {y:70,r:12,c:"#f7c85f"},
    {y:116,r:15,c:"#ef7c42"},
    {y:162,r:12,c:"#f0b54c"},
    {y:210,r:14,c:"#57b6d7"},
    {y:258,r:14,c:"#59b9dc"},
    {y:306,r:13,c:"#a66fd2"},
    {y:354,r:12,c:"#f3c75a"},
  ];
  const stars=[
    [22,44,1],[61,96,1.2],[105,35,.8],[144,82,1.1],[202,42,.8],[278,64,1.2],[344,41,.8],[401,104,1.2],
    [29,156,.8],[85,189,1.1],[366,176,.9],[407,234,.8],[45,289,1.2],[331,301,.8],[385,344,1],[74,364,.8],
    [118,126,.8],[172,122,1],[249,115,.8],[314,135,1.1],[187,320,.8],[269,337,1.2]
  ];
  return <svg viewBox="0 0 430 690" className="reference-art" role="img" aria-label="Meditating silhouette beneath a celestial zodiac and planetary alignment">
    <defs>
      <linearGradient id="csSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#02070b"/><stop offset=".45" stopColor="#061824"/><stop offset=".74" stopColor="#0a1820"/><stop offset="1" stopColor="#02070b"/>
      </linearGradient>
      <radialGradient id="csCore" cx="50%" cy="46%" r="46%">
        <stop offset="0" stopColor="#ffd978" stopOpacity=".78"/><stop offset=".08" stopColor="#d68d32" stopOpacity=".42"/><stop offset=".28" stopColor="#2f6e92" stopOpacity=".16"/><stop offset="1" stopColor="#02070b" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#356d8f"/><stop offset=".12" stopColor="#1b4059"/><stop offset=".38" stopColor="#09141b"/><stop offset="1" stopColor="#02070b"/></linearGradient>
      <radialGradient id="planetGlow"><stop offset="0" stopColor="#fff" stopOpacity=".88"/><stop offset=".4" stopColor="#fff" stopOpacity=".18"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
      <filter id="csGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="csSoft"><feGaussianBlur stdDeviation="11"/></filter>
    </defs>

    <rect width="430" height="690" fill="url(#csSky)"/>
    <rect width="430" height="690" fill="url(#csCore)"/>
    {stars.map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={i%3===0?"#d6ad5b":"#78a2ba"} opacity=".78"/>)}

    <g transform="translate(215 250)" opacity=".88">
      <circle r="191" fill="none" stroke="#bf893e" strokeWidth="1.2"/>
      <circle r="158" fill="none" stroke="#3b6a86" strokeWidth="1"/>
      <circle r="127" fill="none" stroke="#a87536" strokeOpacity=".7"/>
      <circle r="97" fill="none" stroke="#3c6e8b" strokeOpacity=".7"/>
      {Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;return <line key={i} x1={72*Math.cos(a)} y1={72*Math.sin(a)} x2={188*Math.cos(a)} y2={188*Math.sin(a)} stroke={i%2?"#31546a":"#795a32"} strokeOpacity=".18"/>})}
      {signs.map((s,i)=>{const a=(-90+i*30)*Math.PI/180;return <text key={s} x={172*Math.cos(a)} y={5+172*Math.sin(a)} textAnchor="middle" fill="#e0ad51" fontSize="16" fontFamily="Georgia">{s}</text>})}
    </g>

    <line x1="215" y1="20" x2="215" y2="420" stroke="#d7a54d" strokeOpacity=".68"/>
    {planets.map((p,i)=><g key={i} filter="url(#csGlow)"><circle cx="215" cy={p.y} r={p.r+16} fill="url(#planetGlow)" opacity=".16"/><circle cx="215" cy={p.y} r={p.r} fill={p.c}/><circle cx="211" cy={p.y-4} r={p.r*.38} fill="#fff" opacity=".22"/></g>)}

    <path d="M-30 514 Q215 430 460 514 V690H-30Z" fill="url(#earth)" opacity=".84"/>
    <path d="M-25 523 Q215 455 455 523" fill="none" stroke="#d7a64d" strokeOpacity=".3" strokeWidth="2" filter="url(#csSoft)"/>

    <g transform="translate(215 480)">
      <ellipse cx="0" cy="156" rx="118" ry="24" fill="#000" opacity=".78"/>
      <path d="M-29 -45c0-29 18-52 43-52s43 23 43 52c0 22-7 38-17 49 17 9 31 27 37 49 8 30 6 67 11 95h-176c5-28 3-65 11-95 6-22 20-40 37-49-10-11-17-27-17-49z" fill="#080604"/>
      <path d="M-42 -86c14-25 44-38 70-25 17 8 29 24 33 43-12-11-29-16-43-14-22 3-35 17-60-4z" fill="#050403"/>
      <path d="M-52 31c-37 27-60 64-65 106 31-17 64-26 98-26-20-25-30-49-33-80z" fill="#050403"/>
      <path d="M52 31c37 27 60 64 65 106-31-17-64-26-98-26 20-25 30-49 33-80z" fill="#050403"/>
      <path d="M-77 116c22-23 49-35 77-35 29 0 56 12 78 35-17 22-43 35-78 35-34 0-60-13-77-35z" fill="#040302"/>
      <circle cx="0" cy="28" r="24" fill="#b46f28" opacity=".08"/>
      <text x="0" y="37" textAnchor="middle" fill="#d89b3d" fontSize="34">ॐ</text>
    </g>

    <g transform="translate(318 500)" opacity=".9"><path d="M0 78h92L78 38H64L46 8 28 38H14z" fill="#030303"/><rect x="31" y="48" width="30" height="30" fill="#010202"/><circle cx="46" cy="51" r="3" fill="#d59a3a"/></g>

    <rect y="575" width="430" height="115" fill="url(#csSky)" opacity=".9"/>
  </svg>;
}

export function CosmicHorizonArt(){
  const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  return <svg viewBox="0 0 430 620" className="reference-art" role="img" aria-label="Earth horizon beneath a zodiac observatory">
    <defs>
      <linearGradient id="chSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#02070b"/><stop offset=".55" stopColor="#061622"/><stop offset="1" stopColor="#02070b"/></linearGradient>
      <radialGradient id="chSun"><stop offset="0" stopColor="#fff7bf"/><stop offset=".18" stopColor="#ffd066"/><stop offset=".45" stopColor="#d98c31"/><stop offset="1" stopColor="#d98c31" stopOpacity="0"/></radialGradient>
      <linearGradient id="chEarth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d789e"/><stop offset=".18" stopColor="#15445f"/><stop offset=".55" stopColor="#07131a"/><stop offset="1" stopColor="#010406"/></linearGradient>
      <filter id="chGlow"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <rect width="430" height="620" fill="url(#chSky)"/>
    {[[32,60],[88,92],[145,46],[214,78],[277,42],[349,84],[399,56],[47,176],[118,142],[304,162],[382,194],[73,248],[336,261]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%4===0?1.4:.9} fill={i%2?"#78a8c2":"#d5ab57"} opacity=".75"/>)}

    <g transform="translate(215 285)">
      <circle r="184" fill="none" stroke="#b77c32" strokeWidth="1.3" opacity=".88"/>
      <circle r="151" fill="none" stroke="#3c6b87" strokeWidth="1" opacity=".8"/>
      <circle r="120" fill="none" stroke="#aa7431" strokeWidth=".9" opacity=".68"/>
      <circle r="90" fill="none" stroke="#3a657e" strokeWidth=".9" opacity=".65"/>
      {Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;return <line key={i} x1={82*Math.cos(a)} y1={82*Math.sin(a)} x2={180*Math.cos(a)} y2={180*Math.sin(a)} stroke="#78572f" strokeOpacity=".18"/>})}
      {signs.map((s,i)=>{const a=(-90+i*30)*Math.PI/180;return <text key={s} x={168*Math.cos(a)} y={5+168*Math.sin(a)} textAnchor="middle" fill="#d8a54d" fontSize="15" fontFamily="Georgia">{s}</text>})}
    </g>

    <circle cx="215" cy="438" r="70" fill="url(#chSun)" filter="url(#chGlow)" opacity=".65"/>
    <circle cx="215" cy="438" r="15" fill="#ffd06a"/>
    <path d="M-40 470 Q215 352 470 470 V620H-40Z" fill="url(#chEarth)"/>
    <path d="M-40 470 Q215 352 470 470" fill="none" stroke="#f0c66a" strokeOpacity=".75" strokeWidth="1.6"/>
    <path d="M0 492 Q110 455 215 470 T430 492" fill="none" stroke="#4a7d99" strokeOpacity=".48"/>
    <rect y="510" width="430" height="110" fill="url(#chSky)" opacity=".72"/>
  </svg>;
}

export function SacredMarkArt(){
  return <svg viewBox="0 0 220 220" className="sacred-svg" role="img" aria-label="Sacred geometric star">
    <defs><radialGradient id="mGlow"><stop offset="0" stopColor="#f7c356" stopOpacity=".72"/><stop offset="1" stopColor="#061019" stopOpacity="0"/></radialGradient></defs>
    <circle cx="110" cy="110" r="92" fill="url(#mGlow)" opacity=".16"/>
    <circle cx="110" cy="110" r="76" fill="none" stroke="#a77b38" strokeOpacity=".7"/>
    <rect x="43" y="43" width="134" height="134" fill="none" stroke="#a77b38" strokeWidth="1.5" transform="rotate(45 110 110)"/>
    <rect x="68" y="68" width="84" height="84" fill="none" stroke="#3c6075" strokeWidth="1.4" transform="rotate(45 110 110)"/>
    <path d="M110 42l15 45 45 23-45 23-15 45-15-45-45-23 45-23z" fill="none" stroke="#d19b40" strokeWidth="1.5"/>
    <path d="M110 63l12 35 35 12-35 12-12 35-12-35-35-12 35-12z" fill="none" stroke="#c9943f" strokeWidth="1.6"/>
    <circle cx="110" cy="110" r="19" fill="#d99a3d" opacity=".24"/>
    <path d="M110 87l7 16 16 7-16 7-7 16-7-16-16-7 16-7z" fill="#f4bb4d"/>
  </svg>;
}
