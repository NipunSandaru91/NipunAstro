import { evaluateBhavaLordPlacement } from "../rules/bhava-lord-placement.ts";
import { careerCombinations } from "./career-combinations.ts";
type Position={graha_id:number;rasi_id:number};
type ShadbalaRow={graha_id:number;total_bala_rupa:number};
type Input={lagnaRasiId:number;positions:Position[];shadbala:ShadbalaRow[]};
const PRIMARY=[10,2,6,11] as const;
const CONTEXTUAL=[9,12] as const;
function item(source_bhava:number,input:Input){
 return {source_bhava,evidence:evaluateBhavaLordPlacement({lagnaRasiId:input.lagnaRasiId,sourceBhava:source_bhava,positions:input.positions,shadbala:input.shadbala,topic:"CAREER",polarity:"SUPPORTING"})};
}
export function buildCareerNatalModel(input:Input){
 const primary=PRIMARY.map(h=>item(h,input)),contextual=CONTEXTUAL.map(h=>item(h,input));
 const indicators=[...primary,...contextual].map(x=>({source_bhava:x.source_bhava,target_bhava:x.evidence.placement.bhava,graha_id:x.evidence.placement.graha_id}));
 return {topic:"CAREER" as const,model_version:"CAREER_NATAL_V1" as const,primary,contextual,combinations:careerCombinations(indicators)};
}
