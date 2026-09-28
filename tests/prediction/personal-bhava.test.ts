/// <reference lib="deno.ns" />
import { buildPersonalBhavaCards } from "../../lib/prediction/ui/personal-bhava.ts";
import { evaluateBhavaLordPlacement } from "../../lib/prediction/rules/bhava-lord-placement.ts";

const golden=[
  {graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},
  {graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},
  {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4},
];

Deno.test("Personal Bhava V1 creates 12 deterministic readable cards",()=>{
  const cards=buildPersonalBhavaCards({lagnaRasiId:4,positions:golden});
  if(cards.length!==12)throw Error("expected 12 personal bhava cards");
  if(cards[0].rasi_name_si!=="කටක")throw Error("Cancer lagna mapping mismatch");
  if(cards[9].rasi_name_si!=="මේෂ")throw Error("10th bhava sign mismatch");
  if(!cards[9].description_si.includes("වෘත්තිය"))throw Error("10th bhava should describe career theme");
  if(!cards[9].description_si.includes("විදේශ"))throw Error("Golden 10th-lord linkage should surface foreign/background theme");
  if(!cards[9].description_si.includes("සන්නිවේදනය"))throw Error("Golden Mercury/Venus career synthesis should surface communication");
  if(!cards[9].description_si.includes("design"))throw Error("Golden Mercury/Venus career synthesis should surface creative/design work");
  if(!cards[9].description_si.includes("online"))throw Error("Golden 10th lord in 12th/Gemini should surface online/remote work");
  for(const card of cards){
    if(card.description_si.includes("ෂඩ්බල")||card.description_si.includes("rule code"))throw Error("technical evidence leaked into Personal copy");
    if(card.description_si.split(".").filter(Boolean).length<7)throw Error("Personal card detail is too short");
  }
});


Deno.test("Personal Bhava V1 covers strength tones and missing-lord guard",()=>{
  const high=[1,2,3,4,5,6,7].map(graha_id=>({graha_id,total_bala_rupa:100}));
  const low=[1,2,3,4,5,6,7].map(graha_id=>({graha_id,total_bala_rupa:0}));
  const strong=buildPersonalBhavaCards({lagnaRasiId:4,positions:golden,shadbala:high});
  const challenged=buildPersonalBhavaCards({lagnaRasiId:4,positions:golden,shadbala:low});
  if(!strong.some(x=>x.description_si.includes("සහායක සාධක")))throw Error("supporting tone not covered");
  if(!challenged.some(x=>x.description_si.includes("ඉවසීම")))throw Error("challenging tone not covered");

  let rejected=false;
  try{buildPersonalBhavaCards({lagnaRasiId:4,positions:golden.filter(x=>x.graha_id!==3)})}catch{rejected=true}
  if(!rejected)throw Error("missing lord position must be rejected");
});


Deno.test("Bhava V1 foundation evidence exists for every one of the 12 houses",()=>{
  const seen=new Set<number>();
  for(let sourceBhava=1;sourceBhava<=12;sourceBhava++){
    const evidence=evaluateBhavaLordPlacement({
      lagnaRasiId:4,
      sourceBhava,
      positions:golden,
      topic:"CAREER",
      polarity:"SUPPORTING",
    });
    if(evidence.rule.code!=="BHAVA_LORD_PLACEMENT")throw Error(`Bhava ${sourceBhava} missing base rule`);
    if(!evidence.rule.text_si)throw Error(`Bhava ${sourceBhava} missing readable evidence`);
    seen.add(sourceBhava);
  }
  if(seen.size!==12)throw Error("all 12 bhavas must have base evidence");
});


Deno.test("Personal career narrative covers alternate 10th-house evidence shapes",()=>{
  const ariesLagna=[
    {graha_id:1,rasi_id:1},{graha_id:2,rasi_id:4},{graha_id:3,rasi_id:5},
    {graha_id:4,rasi_id:6},{graha_id:5,rasi_id:9},{graha_id:6,rasi_id:2},
    {graha_id:7,rasi_id:12},{graha_id:8,rasi_id:11},{graha_id:9,rasi_id:8},
  ];
  const ariesCareer=buildPersonalBhavaCards({lagnaRasiId:1,positions:ariesLagna})[9].description_si;
  if(!ariesCareer.includes("පසුබිම් කටයුතු"))throw Error("12th-house alternate lord path not covered");
  if(!ariesCareer.includes("මීන"))throw Error("non-Gemini 12th-house lord path not covered");
  if(!ariesCareer.includes("සෘජු ග්‍රහ පිහිටීමක් නැති"))throw Error("empty 10th-house path not covered");

  const virgoLagna=[
    {graha_id:1,rasi_id:5},{graha_id:2,rasi_id:4},{graha_id:3,rasi_id:1},
    {graha_id:4,rasi_id:3},{graha_id:5,rasi_id:9},{graha_id:6,rasi_id:2},
    {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:11},{graha_id:9,rasi_id:8},
  ];
  const mercuryCareer=buildPersonalBhavaCards({lagnaRasiId:6,positions:virgoLagna})[9].description_si;
  if(!mercuryCareer.includes("ගණනය"))throw Error("Mercury-only career path not covered");

  const leoLagna=[
    {graha_id:1,rasi_id:5},{graha_id:2,rasi_id:4},{graha_id:3,rasi_id:1},
    {graha_id:4,rasi_id:3},{graha_id:5,rasi_id:9},{graha_id:6,rasi_id:2},
    {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:11},{graha_id:9,rasi_id:8},
  ];
  const venusCareer=buildPersonalBhavaCards({lagnaRasiId:5,positions:leoLagna})[9].description_si;
  if(!venusCareer.includes("සෞන්දර්යය"))throw Error("Venus-only career path not covered");
});
