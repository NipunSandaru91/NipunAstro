/// <reference lib="deno.ns" />

import { drishtiModifiers } from "../../lib/prediction/modifiers/drishti.ts";

const GOLDEN=[
 {graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},
 {graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},
 {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4},
];

Deno.test("Golden Chart: Jupiter does not falsely aspect Mars in Gemini",()=>{
 const m=drishtiModifiers({targetGrahaId:3,positions:GOLDEN,lagnaRasiId:4});
 if(m.some(x=>x.source_graha_id===5))throw new Error("false Jupiter aspect to Mars");
});

Deno.test("Jupiter special 9th drishti is retained when target is Pisces",()=>{
 const positions=[{graha_id:5,rasi_id:4},{graha_id:3,rasi_id:12}];
 const m=drishtiModifiers({targetGrahaId:3,positions,lagnaRasiId:4});
 const j=m.find(x=>x.source_graha_id===5);
 if(!j||j.code!=="BENEFIC_DRISHTI"||j.polarity!=="SUPPORTING")throw new Error("Jupiter aspect classification changed");
 if(j.house_offset!==9||!j.is_special)throw new Error("Jupiter special drishti trace lost");
 if(j.rule_version!=="PARASHARI_GRAHA_DRISHTI_V1")throw new Error("drishti version lost");
});

Deno.test("Saturn full drishti is retained as contradicting influence",()=>{
 const positions=[{graha_id:7,rasi_id:10},{graha_id:3,rasi_id:4}];
 const m=drishtiModifiers({targetGrahaId:3,positions,lagnaRasiId:4});
 const saturn=m.find(x=>x.source_graha_id===7);
 if(!saturn||saturn.polarity!=="CONTRADICTING"||saturn.code!=="MALEFIC_DRISHTI")throw new Error("Saturn influence missing");
});

Deno.test("no aspect produces no modifier",()=>{
 const m=drishtiModifiers({targetGrahaId:4,positions:[{graha_id:5,rasi_id:4},{graha_id:4,rasi_id:4}],lagnaRasiId:4});
 if(m.length!==0)throw new Error("false aspect modifier");
});
