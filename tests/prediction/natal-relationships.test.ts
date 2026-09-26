/// <reference lib="deno.ns" />
import { houseOccupancyEvidence, conjunctionEvidence } from "../../lib/prediction/rules/natal-relationships.ts";

const positions=[
 {graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},
 {graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},
 {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4},
];

Deno.test("Golden Chart derives house occupancy from Lagna and Rasi",()=>{
 const e=houseOccupancyEvidence({lagnaRasiId:4,grahaId:1,positions,topic:"EDUCATION",polarity:"SUPPORTING"});
 if(e.placement.bhava!==9||e.placement.rasi_id!==12)throw new Error("Sun 9th occupancy changed");
 if(e.rule.code!=="HOUSE_OCCUPANCY")throw new Error("occupancy rule trace missing");
});

Deno.test("Golden Chart derives Mercury Venus conjunction in Aries",()=>{
 const e=conjunctionEvidence({lagnaRasiId:4,grahaAId:4,grahaBId:6,positions,topic:"CAREER",polarity:"SUPPORTING"});
 if(e.length!==2||e.some(x=>x.placement.rasi_id!==1||x.placement.bhava!==10))throw new Error("Mercury Venus conjunction changed");
 if(e.some(x=>x.rule.code!=="CONJUNCTION"))throw new Error("conjunction trace missing");
});

Deno.test("conjunction rule rejects planets in different signs",()=>{
 let failed=false;try{conjunctionEvidence({lagnaRasiId:4,grahaAId:3,grahaBId:5,positions,topic:"CAREER",polarity:"SUPPORTING"});}catch(e){failed=e instanceof Error&&e.message==="GRAHAS_NOT_CONJUNCT";}
 if(!failed)throw new Error("false conjunction accepted");
});
