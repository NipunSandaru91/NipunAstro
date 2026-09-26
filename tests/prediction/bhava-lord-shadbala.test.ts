/// <reference lib="deno.ns" />
import { evaluateBhavaLordPlacement } from "../../lib/prediction/rules/bhava-lord-placement.ts";

const positions=[
 {graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},
 {graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},
 {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4},
];

Deno.test("bhava lord evidence consumes matching calculated Shadbala row",()=>{
 const e=evaluateBhavaLordPlacement({
  lagnaRasiId:4,sourceBhava:10,positions,topic:"CAREER",polarity:"SUPPORTING",
  shadbala:[{graha_id:3,total_bala_rupa:5.25},{graha_id:5,total_bala_rupa:7.1}],
 });
 const m=e.strength.supporting.find(x=>x.code==="SHADBALA_ABOVE_MINIMUM");
 if(!m)throw new Error("Mars Shadbala modifier missing");
});

Deno.test("below-minimum lord Shadbala becomes contradicting evidence",()=>{
 const e=evaluateBhavaLordPlacement({
  lagnaRasiId:4,sourceBhava:10,positions,topic:"CAREER",polarity:"SUPPORTING",
  shadbala:[{graha_id:3,total_bala_rupa:4.75}],
 });
 if(!e.strength.contradicting.some(x=>x.code==="SHADBALA_BELOW_MINIMUM"))throw new Error("weak Mars Shadbala missing");
});

Deno.test("missing Shadbala row is explicit rather than silently neutral",()=>{
 let failed=false;
 try{evaluateBhavaLordPlacement({lagnaRasiId:4,sourceBhava:10,positions,topic:"CAREER",polarity:"SUPPORTING",shadbala:[]});}
 catch(error){failed=error instanceof Error&&error.message==="SHADBALA_ROW_MISSING";}
 if(!failed)throw new Error("missing Shadbala must fail");
});
