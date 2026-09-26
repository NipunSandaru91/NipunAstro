/// <reference lib="deno.ns" />
import { buildCareerConclusion, renderCareerConclusionSi } from "../../lib/prediction/interpretation/career.ts";

const theme={code:"FOREIGN_LINKED_CAREER",level:"STRONG" as const,text_si:"විදේශ සම්බන්ධ වෘත්තීය තේමාවට සාධක කිහිපයක් සහාය දක්වයි",evidence_refs:["10L-12H-G3"],evidence_grahas:[3],supporting:[{code:"BENEFIC_DRISHTI",polarity:"SUPPORTING" as const,text_si:"ගුරු දෘෂ්ටිය සහාය දක්වයි"}],contradicting:[{code:"DUSTHANA_PLACEMENT",polarity:"CONTRADICTING" as const,text_si:"12 වන භාව පිහිටීම අභියෝග එක් කරයි"}],strength:"STRONG" as const,rule_version:"CAREER_COMBINATIONS_V1" as const};
const timing={theme_code:"FOREIGN_LINKED_CAREER",natal_level:"STRONG" as const,status:"ACTIVE_NOW" as const,level:"STRONG" as const,rule_version:"CAREER_TIMING_V1" as const};

Deno.test("career conclusion preserves evidence and timing without probability",()=>{
 const c=buildCareerConclusion({theme,timing});
 if(c.topic!=="CAREER"||c.conclusion_version!=="CAREER_CONCLUSION_V1")throw new Error("conclusion identity changed");
 if(c.supporting.length!==1||c.contradicting.length!==1)throw new Error("evidence trace lost");
 if("probability" in c)throw new Error("probability semantics leaked into conclusion");
});

Deno.test("Sinhala renderer exposes result reason support contradiction and timing",()=>{
 const c=buildCareerConclusion({theme,timing});
 const r=renderCareerConclusionSi(c);
 for(const key of ["ප්‍රතිඵලය","හේතුව","සහායක සාධක","විරුද්ධ සාධක","කාල සක්‍රීයතාව","අවසාන නිගමනය"]){
  if(!r.includes(key))throw new Error(`missing Sinhala section: ${key}`);
 }
 if(!r.includes("දශා")||!r.includes("ගෝචර"))throw new Error("timing explanation missing");
});
