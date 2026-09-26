/// <reference lib="deno.ns" />
import { buildCareerConclusion, renderCareerConclusionSi } from "../../lib/prediction/interpretation/career.ts";
import { drishtiModifiers } from "../../lib/prediction/modifiers/drishti.ts";
import { evaluateBhavaLordPlacement } from "../../lib/prediction/rules/bhava-lord-placement.ts";
import { lordRelationshipEvidence } from "../../lib/prediction/rules/lord-relationship.ts";
import { houseOccupancyEvidence, conjunctionEvidence } from "../../lib/prediction/rules/natal-relationships.ts";
import { combineCareerTiming } from "../../lib/prediction/timing/career-timing.ts";
import { careerTransitActivation } from "../../lib/prediction/timing/career-transit.ts";
import { aggregateCareerThemes } from "../../lib/prediction/topics/career-aggregation.ts";
import type { AggregatedCareerTheme } from "../../lib/prediction/topics/career-aggregation.ts";

function throws(fn:()=>unknown,message:string){let ok=false;try{fn();}catch{ok=true;}if(!ok)throw new Error(message);}
const baseTheme:AggregatedCareerTheme={code:"FOREIGN_LINKED_CAREER",strength:"WEAK",level:"WEAK",text_si:"x",evidence_refs:["10L-12H-G3"],evidence_grahas:[3],supporting:[],contradicting:[],rule_version:"CAREER_COMBINATIONS_V1"};
const positions=[{graha_id:1,rasi_id:12},{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3},{graha_id:4,rasi_id:1},{graha_id:5,rasi_id:4},{graha_id:6,rasi_id:1},{graha_id:7,rasi_id:10},{graha_id:8,rasi_id:10},{graha_id:9,rasi_id:4}];

Deno.test("career interpretation covers mismatch, empty evidence and inactive conclusion branches",()=>{
 throws(()=>buildCareerConclusion({theme:baseTheme,timing:{theme_code:"OTHER",natal_level:"WEAK",status:"DORMANT",level:"WEAK",rule_version:"CAREER_TIMING_V1"}}),"theme mismatch accepted");
 const c=buildCareerConclusion({theme:baseTheme,timing:{theme_code:"FOREIGN_LINKED_CAREER",natal_level:"WEAK",status:"DORMANT",level:"WEAK",rule_version:"CAREER_TIMING_V1"}});
 const s=renderCareerConclusionSi(c);
 if(!s.includes("විශේෂ සාධක")||!s.includes("placement reasoning නොමැත")||!s.includes("DORMANT")&& !s.includes("දැනට නොපෙනේ"))throw new Error("inactive renderer branches missing");
 for(const status of ["DASHA_ACTIVE_WAITING_TRIGGER","TRANSIT_ONLY"] as const){
  const out=renderCareerConclusionSi({...c,timing_status:status,timing_level:"MODERATE"});
  if(!out.includes("MODERATE"))throw new Error("timing renderer branch missing");
 }
});

Deno.test("prediction rule guards cover invalid bhava and missing positions",()=>{
 throws(()=>evaluateBhavaLordPlacement({lagnaRasiId:4,sourceBhava:13,positions,topic:"CAREER",polarity:"SUPPORTING"}),"invalid source bhava accepted");
 throws(()=>lordRelationshipEvidence({lagnaRasiId:4,houseA:13,houseB:4,positions,topic:"CAREER",polarity:"SUPPORTING"}),"invalid relationship bhava accepted");
 throws(()=>lordRelationshipEvidence({lagnaRasiId:4,houseA:10,houseB:7,positions:[],topic:"CAREER",polarity:"SUPPORTING"}),"missing lord positions accepted");
 throws(()=>houseOccupancyEvidence({lagnaRasiId:4,positions:[],topic:"CAREER",polarity:"SUPPORTING",grahaId:3}),"missing occupancy position accepted");
 throws(()=>conjunctionEvidence({lagnaRasiId:4,positions:[{graha_id:3,rasi_id:3}],topic:"CAREER",polarity:"SUPPORTING",grahaAId:3,grahaBId:4}),"missing conjunction position accepted");
});

Deno.test("drishti covers missing target and neutral graha branches",()=>{
 throws(()=>drishtiModifiers({targetGrahaId:3,positions:[],lagnaRasiId:4}),"missing target accepted");
 const neutral=drishtiModifiers({targetGrahaId:3,positions:[{graha_id:2,rasi_id:9},{graha_id:3,rasi_id:3}],lagnaRasiId:4});
 if(neutral.length!==0)throw new Error("neutral Moon aspect became modifier");
});

Deno.test("timing covers dormant state and transit graha-only trigger",()=>{
 const dormant=combineCareerTiming({themeCode:"X",natalLevel:"WEAK",dasha:{status:"DORMANT",activation_level:"NONE"},transit:{status:"UNTRIGGERED",activation_level:"NONE"}});
 if(dormant.status!=="DORMANT")throw new Error("dormant timing branch missing");
 const a=careerTransitActivation({lagnaRasiId:4,themes:[{code:"X",level:"WEAK",evidence_grahas:[5],evidence_houses:[]}],transits:[{graha_id:5,rasi_id:2}]})[0];
 if(a.triggers[0]?.reason!=="EVIDENCE_GRAHA")throw new Error("graha transit branch missing");
});

Deno.test("career aggregation covers weak and moderate balance branches plus malformed ref",()=>{
 const weak={code:"FOREIGN_LINKED_CAREER" as const,strength:"WEAK" as const,evidence_refs:["10L-12H-G3"],text_si:"x",rule_version:"CAREER_COMBINATIONS_V1" as const};
 const w=aggregateCareerThemes([weak],[{ref:"10L-12H-G3",supporting:[],contradicting:[]}])[0];
 if(w.level!=="WEAK")throw new Error("weak aggregation branch missing");
 const strong={...weak,strength:"STRONG" as const,evidence_refs:["bad-ref"]};
 const m=aggregateCareerThemes([strong],[{ref:"bad-ref",supporting:[],contradicting:[]}])[0];
 if(m.level!=="MODERATE"||m.evidence_grahas.length!==0)throw new Error("moderate or malformed-ref branch missing");
});

Deno.test("coverage closes nullish Shadbala, aggregation Set duplicate, and transit precedence branches",()=>{
 const noShad=evaluateBhavaLordPlacement({lagnaRasiId:4,sourceBhava:10,positions,topic:"CAREER",polarity:"SUPPORTING"});
 if(!noShad)throw new Error("optional Shadbala branch failed");
 const dup={code:"FOREIGN_LINKED_CAREER" as const,strength:"WEAK" as const,evidence_refs:["10L-12H-G3","2L-11H-G3"],text_si:"x",rule_version:"CAREER_COMBINATIONS_V1" as const};
 const ag=aggregateCareerThemes([dup],[])[0];
 if(ag.evidence_grahas.length!==1||ag.evidence_grahas[0]!==3)throw new Error("graha Set dedupe branch changed");
 const tr=careerTransitActivation({lagnaRasiId:4,themes:[{code:"X",level:"WEAK",evidence_grahas:[5],evidence_houses:[11]}],transits:[{graha_id:5,rasi_id:2}]})[0];
 if(tr.triggers[0]?.reason!=="EVIDENCE_HOUSE")throw new Error("house trigger precedence changed");
});
