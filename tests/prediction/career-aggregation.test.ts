/// <reference lib="deno.ns" />
import { aggregateCareerThemes } from "../../lib/prediction/topics/career-aggregation.ts";

const combo={code:"FOREIGN_LINKED_CAREER" as const,strength:"STRONG" as const,evidence_refs:["10L-12H-G3","12L-1H-G4"],text_si:"x",rule_version:"CAREER_COMBINATIONS_V1" as const};
const evidence=[
 {ref:"10L-12H-G3",supporting:[{code:"JUPITER_DRISHTI",polarity:"SUPPORTING" as const,text_si:"ගුරු දෘෂ්ටිය"}],contradicting:[{code:"DUSTHANA_PLACEMENT",polarity:"CONTRADICTING" as const,text_si:"12 භාවය"}]},
 {ref:"12L-1H-G4",supporting:[{code:"SHADBALA_ABOVE_MINIMUM",polarity:"SUPPORTING" as const,text_si:"ෂඩ්බලය"}],contradicting:[]},
];

Deno.test("career aggregation preserves both supporting and contradicting evidence",()=>{
 const a=aggregateCareerThemes([combo],evidence)[0];
 if(a.supporting.length!==2||a.contradicting.length!==1)throw new Error("career evidence balance lost");
 if(a.level!=="STRONG")throw new Error("convergent career theme should remain strong");
});
Deno.test("strong combination is downgraded when contradictions dominate",()=>{
 const bad=[{ref:"10L-12H-G3",supporting:[],contradicting:[
  {code:"A",polarity:"CONTRADICTING" as const,text_si:"a"},
  {code:"B",polarity:"CONTRADICTING" as const,text_si:"b"},
  {code:"C",polarity:"CONTRADICTING" as const,text_si:"c"},
 ]},{ref:"12L-1H-G4",supporting:[],contradicting:[]}];
 const a=aggregateCareerThemes([combo],bad)[0];
 if(a.level!=="WEAK")throw new Error("contradictions did not downgrade theme");
});
