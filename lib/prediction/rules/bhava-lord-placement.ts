import { allBhavas, houseFromRasi } from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import { createPlacementEvidence, type EvidencePolarity, type PredictionTopic } from "../evidence.ts";
import { grahaQualitySi, rasiQualitySi } from "../qualities.ts";
import { placementModifiers } from "../modifiers/placement.ts";
import { drishtiModifiers } from "../modifiers/drishti.ts";
import { shadbalaModifier } from "../modifiers/shadbala.ts";

type Position={graha_id:number;rasi_id:number};
type ShadbalaRow={graha_id:number;total_bala_rupa:number};
type Input={lagnaRasiId:number;sourceBhava:number;positions:Position[];topic:PredictionTopic;polarity:EvidencePolarity;shadbala?:ShadbalaRow[]};

export function evaluateBhavaLordPlacement(input:Input){
  const source=allBhavas(input.lagnaRasiId).find((b)=>b.bhava===input.sourceBhava);
  if(!source)throw new Error("BHAVA_NOT_FOUND");
  const position=input.positions.find((p)=>p.graha_id===source.lord_graha_id);
  if(!position)throw new Error("BHAVA_LORD_POSITION_MISSING");
  const targetBhava=houseFromRasi(input.lagnaRasiId,position.rasi_id);
  const graha=grahaQualitySi(position.graha_id);
  const shadbalaRow=input.shadbala?.find((row)=>row.graha_id===position.graha_id);
  if(input.shadbala&&!shadbalaRow)throw new Error("SHADBALA_ROW_MISSING");
  const rasi=rasiQualitySi(position.rasi_id);
  return createPlacementEvidence({
    id:`${input.topic.toLowerCase()}-${input.sourceBhava}l-${targetBhava}h-g${position.graha_id}`,
    topic:input.topic,polarity:input.polarity,grahaId:position.graha_id,rasiId:position.rasi_id,bhava:targetBhava,
    modifiers:[...placementModifiers({grahaId:position.graha_id,rasiId:position.rasi_id,bhava:targetBhava}),...drishtiModifiers({targetGrahaId:position.graha_id,positions:input.positions,lagnaRasiId:input.lagnaRasiId}),...(shadbalaRow?[shadbalaModifier({grahaId:position.graha_id,totalBalaRupa:shadbalaRow.total_bala_rupa})]:[])],
    ruleCode:"BHAVA_LORD_PLACEMENT",
    ruleTextSi:`${input.sourceBhava} වන භාව අධිපති ${graha.name_si} ${targetBhava} වන භාවයේ ${rasi.name_si} රාශියේ පිහිටයි`,
    source:{kind:"NATAL_D1",engineVersion:"PREDICTION_RULES_V1"},
  });
}
