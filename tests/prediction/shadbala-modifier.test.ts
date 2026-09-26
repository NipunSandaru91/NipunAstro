/// <reference lib="deno.ns" />

import { shadbalaModifier } from "../../lib/prediction/modifiers/shadbala.ts";

Deno.test("Shadbala modifier preserves calculated Rupa and engine version",()=>{
 const m=shadbalaModifier({grahaId:3,totalBalaRupa:6.25,minimumRupa:5});
 if(m.code!=="SHADBALA_ABOVE_MINIMUM"||m.polarity!=="SUPPORTING")throw new Error("strong Shadbala classification changed");
 if(m.total_bala_rupa!==6.25||m.minimum_rupa!==5||m.rule_version!=="SHADBALA_MODIFIER_V1")throw new Error("Shadbala trace lost");
});

Deno.test("Shadbala below configured minimum is contradicting",()=>{
 const m=shadbalaModifier({grahaId:3,totalBalaRupa:4.5,minimumRupa:5});
 if(m.code!=="SHADBALA_BELOW_MINIMUM"||m.polarity!=="CONTRADICTING")throw new Error("weak Shadbala classification changed");
});

Deno.test("Shadbala modifier refuses nodes and invalid thresholds",()=>{
 for(const input of [
  {grahaId:8,totalBalaRupa:6,minimumRupa:5},
  {grahaId:3,totalBalaRupa:Number.NaN,minimumRupa:5},
  {grahaId:3,totalBalaRupa:6,minimumRupa:0},
 ]){
  let failed=false;try{shadbalaModifier(input)}catch{failed=true}
  if(!failed)throw new Error("invalid Shadbala modifier input accepted");
 }
});
