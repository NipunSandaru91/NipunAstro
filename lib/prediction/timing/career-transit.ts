import { houseFromRasi } from "../../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
type Level="WEAK"|"MODERATE"|"STRONG";
type Theme={code:string;level:Level;evidence_grahas:readonly number[];evidence_houses:readonly number[]};
type Transit={graha_id:number;rasi_id:number};
export type TransitTrigger={graha_id:number;rasi_id:number;bhava:number;reason:"EVIDENCE_HOUSE"|"EVIDENCE_GRAHA"};
export function careerTransitActivation(input:{lagnaRasiId:number;themes:readonly Theme[];transits:readonly Transit[]}){
 return input.themes.map(theme=>{
  const triggers:TransitTrigger[]=[];
  for(const t of input.transits){
   const bhava=houseFromRasi(input.lagnaRasiId,t.rasi_id);
   if(theme.evidence_houses.includes(bhava))triggers.push({graha_id:t.graha_id,rasi_id:t.rasi_id,bhava,reason:"EVIDENCE_HOUSE"});
   else if(theme.evidence_grahas.includes(t.graha_id))triggers.push({graha_id:t.graha_id,rasi_id:t.rasi_id,bhava,reason:"EVIDENCE_GRAHA"});
  }
  return {theme_code:theme.code,natal_level:theme.level,status:triggers.length?"TRIGGERED" as const:"UNTRIGGERED" as const,activation_level:triggers.length>=2?"STRONG" as const:triggers.length===1?"MODERATE" as const:"NONE" as const,triggers,source:{kind:"TRANSIT" as const,engine_version:"TRANSIT_PREDICTION_ADAPTER_V1" as const},rule_version:"CAREER_TRANSIT_ACTIVATION_V1" as const};
 });
}
