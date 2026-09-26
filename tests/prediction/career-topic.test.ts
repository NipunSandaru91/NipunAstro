/// <reference lib="deno.ns" />
import { buildCareerNatalModel } from "../../lib/prediction/topics/career.ts";

const positions=[
 {graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},
 {graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},
 {graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4},
];
const shadbala=[1,2,3,4,5,6,7].map(graha_id=>({graha_id,total_bala_rupa:graha_id===3?5.25:7}));

Deno.test("Career V1 separates primary and contextual natal houses",()=>{
 const m=buildCareerNatalModel({lagnaRasiId:4,positions,shadbala});
 if(m.topic!=="CAREER"||m.model_version!=="CAREER_NATAL_V1")throw new Error("career model identity changed");
 if(m.primary.map(x=>x.source_bhava).join(",")!=="10,2,6,11")throw new Error("primary career houses changed");
 if(m.contextual.map(x=>x.source_bhava).join(",")!=="9,12")throw new Error("contextual career houses changed");
});

Deno.test("Golden Career primary evidence derives 10th lord Mars into Gemini 12th",()=>{
 const m=buildCareerNatalModel({lagnaRasiId:4,positions,shadbala});
 const tenth=m.primary.find(x=>x.source_bhava===10);
 if(!tenth||tenth.evidence.placement.graha_id!==3||tenth.evidence.placement.rasi_id!==3||tenth.evidence.placement.bhava!==12)throw new Error("Golden 10th lord chain changed");
 if(!tenth.evidence.strength.supporting.some(x=>x.code==="SHADBALA_ABOVE_MINIMUM"))throw new Error("calculated Mars Shadbala missing");
 if(!tenth.evidence.strength.contradicting.some(x=>x.code==="DUSTHANA_PLACEMENT"))throw new Error("12th-house contradiction missing");
});

Deno.test("Career V1 preserves evidence, not prose verdicts",()=>{
 const m=buildCareerNatalModel({lagnaRasiId:4,positions,shadbala});
 if("prediction_text" in m||"probability" in m)throw new Error("premature prose/probability entered topic model");
});
