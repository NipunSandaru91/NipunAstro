import { houseFromRasi } from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import { createPlacementEvidence,type EvidencePolarity,type PredictionTopic } from "../evidence.ts";
import { grahaQualitySi,rasiQualitySi } from "../qualities.ts";
type Position={graha_id:number;rasi_id:number};
type Base={lagnaRasiId:number;positions:Position[];topic:PredictionTopic;polarity:EvidencePolarity};
function positionOf(positions:Position[],grahaId:number){const p=positions.find(x=>x.graha_id===grahaId);if(!p)throw new Error("GRAHA_POSITION_MISSING");return p;}
export function houseOccupancyEvidence(input:Base&{grahaId:number}){
 const p=positionOf(input.positions,input.grahaId),bhava=houseFromRasi(input.lagnaRasiId,p.rasi_id);
 return createPlacementEvidence({id:`${input.topic.toLowerCase()}-occupancy-g${p.graha_id}-h${bhava}`,topic:input.topic,polarity:input.polarity,grahaId:p.graha_id,rasiId:p.rasi_id,bhava,
  ruleCode:"HOUSE_OCCUPANCY",ruleTextSi:`${grahaQualitySi(p.graha_id).name_si} ${bhava} වන භාවයේ ${rasiQualitySi(p.rasi_id).name_si} රාශියේ පිහිටයි`,source:{kind:"NATAL_D1",engineVersion:"PREDICTION_RULES_V1"}});
}
export function conjunctionEvidence(input:Base&{grahaAId:number;grahaBId:number}){
 const a=positionOf(input.positions,input.grahaAId),b=positionOf(input.positions,input.grahaBId);
 if(a.rasi_id!==b.rasi_id)throw new Error("GRAHAS_NOT_CONJUNCT");
 const bhava=houseFromRasi(input.lagnaRasiId,a.rasi_id);
 const text=`${grahaQualitySi(a.graha_id).name_si} සහ ${grahaQualitySi(b.graha_id).name_si} ${rasiQualitySi(a.rasi_id).name_si} රාශියේ ${bhava} වන භාවයේ සංයෝග වේ`;
 return [a,b].map(p=>createPlacementEvidence({id:`${input.topic.toLowerCase()}-conjunction-g${a.graha_id}-g${b.graha_id}-focus${p.graha_id}`,topic:input.topic,polarity:input.polarity,grahaId:p.graha_id,rasiId:p.rasi_id,bhava,ruleCode:"CONJUNCTION",ruleTextSi:text,source:{kind:"NATAL_D1",engineVersion:"PREDICTION_RULES_V1"}}));
}
