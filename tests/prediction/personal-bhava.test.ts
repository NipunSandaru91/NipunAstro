/// <reference lib="deno.ns" />
import { buildPersonalBhavaCards } from "../../lib/prediction/ui/personal-bhava.ts";

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
  for(const card of cards){
    if(card.description_si.includes("ෂඩ්බල")||card.description_si.includes("rule code"))throw Error("technical evidence leaked into Personal copy");
    if(card.description_si.split(".").filter(Boolean).length<7)throw Error("Personal card detail is too short");
  }
});
