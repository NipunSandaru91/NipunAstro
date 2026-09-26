import { allBhavas,houseFromRasi } from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import type { EvidencePolarity,PredictionTopic } from "../evidence.ts";
type Position={graha_id:number;rasi_id:number};
type Input={lagnaRasiId:number;houseA:number;houseB:number;positions:Position[];topic:PredictionTopic;polarity:EvidencePolarity};
export type LordRelationship={house_a:number;house_b:number;lord_a_graha_id:number;lord_b_graha_id:number;relationship:"CONJUNCTION"|"NONE";rasi_id:number|null;bhava:number|null;rule_code:"LORD_RELATIONSHIP";engine_version:"PREDICTION_RULES_V1"};
export function lordRelationshipEvidence(input:Input):LordRelationship{
 const bhavas=allBhavas(input.lagnaRasiId),a=bhavas.find(x=>x.bhava===input.houseA),b=bhavas.find(x=>x.bhava===input.houseB);
 if(!a||!b)throw new Error("BHAVA_NOT_FOUND");
 const pa=input.positions.find(x=>x.graha_id===a.lord_graha_id),pb=input.positions.find(x=>x.graha_id===b.lord_graha_id);
 if(!pa||!pb)throw new Error("LORD_POSITION_MISSING");
 const conjunct=pa.rasi_id===pb.rasi_id;
 return {house_a:input.houseA,house_b:input.houseB,lord_a_graha_id:a.lord_graha_id,lord_b_graha_id:b.lord_graha_id,relationship:conjunct?"CONJUNCTION":"NONE",rasi_id:conjunct?pa.rasi_id:null,bhava:conjunct?houseFromRasi(input.lagnaRasiId,pa.rasi_id):null,rule_code:"LORD_RELATIONSHIP",engine_version:"PREDICTION_RULES_V1"};
}
