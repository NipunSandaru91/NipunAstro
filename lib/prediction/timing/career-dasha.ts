import { VIMSHOTTARI_ENGINE_VERSION } from "../../../supabase/functions/jyotisha-calculator/core/dasha.ts";
type Level="WEAK"|"MODERATE"|"STRONG";
type Theme={code:string;level:Level;evidence_grahas:readonly number[]};
export type CareerDashaActivation={theme_code:string;natal_level:Level;status:"ACTIVE"|"DORMANT";activation_level:"NONE"|"MODERATE"|"STRONG";mahadasa_graha_id:number;antardasa_graha_id:number;matched_lords:number[];source:{kind:"DASHA";engine_version:typeof VIMSHOTTARI_ENGINE_VERSION};rule_version:"CAREER_DASHA_ACTIVATION_V1"};
export function careerDashaActivation(input:{themes:readonly Theme[];mahadasaGrahaId:number;antardasaGrahaId:number}):CareerDashaActivation[]{
 return input.themes.map(theme=>{
  const matched=[input.mahadasaGrahaId,input.antardasaGrahaId].filter((id,i,a)=>theme.evidence_grahas.includes(id)&&a.indexOf(id)===i);
  return {theme_code:theme.code,natal_level:theme.level,status:matched.length?"ACTIVE" as const:"DORMANT" as const,activation_level:matched.length>=2?"STRONG" as const:matched.length===1?"MODERATE" as const:"NONE" as const,mahadasa_graha_id:input.mahadasaGrahaId,antardasa_graha_id:input.antardasaGrahaId,matched_lords:matched,source:{kind:"DASHA" as const,engine_version:VIMSHOTTARI_ENGINE_VERSION},rule_version:"CAREER_DASHA_ACTIVATION_V1" as const};
 });
}
