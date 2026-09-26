import { allGrahaAspects } from "../../../supabase/functions/jyotisha-calculator/core/drishti.ts";
import { grahaQualitySi } from "../qualities.ts";
import type { EvidenceModifier } from "../strength.ts";

type Position={graha_id:number;rasi_id:number};
export type DrishtiModifier=EvidenceModifier&{
 source_graha_id:number;
 target_graha_id:number;
 house_offset:number;
 is_special:boolean;
 rule_version:"PARASHARI_GRAHA_DRISHTI_V1";
};

const NATURAL_BENEFICS=new Set([5,6]);
const NATURAL_MALEFICS=new Set([1,3,7,8,9]);

export function drishtiModifiers(input:{targetGrahaId:number;positions:Position[];lagnaRasiId:number}):DrishtiModifier[]{
 const target=input.positions.find(p=>p.graha_id===input.targetGrahaId);
 if(!target)throw new Error("TARGET_GRAHA_POSITION_MISSING");
 const modifiers:DrishtiModifier[]=[];
 for(const a of allGrahaAspects(input.positions,input.lagnaRasiId)
  .filter(a=>a.target_rasi_id===target.rasi_id&&a.source_graha_id!==input.targetGrahaId)){
    const source=grahaQualitySi(a.source_graha_id);
    if(NATURAL_BENEFICS.has(a.source_graha_id))modifiers.push({
      code:"BENEFIC_DRISHTI",polarity:"SUPPORTING",
      text_si:`${source.name_si} ග්‍රහයාගේ පූර්ණ දෘෂ්ටිය ලැබේ`,
      source_graha_id:a.source_graha_id,target_graha_id:input.targetGrahaId,
      house_offset:a.house_offset,is_special:a.is_special,rule_version:a.rule_version,
    });
    else if(NATURAL_MALEFICS.has(a.source_graha_id))modifiers.push({
      code:"MALEFIC_DRISHTI",polarity:"CONTRADICTING",
      text_si:`${source.name_si} ග්‍රහයාගේ පූර්ණ දෘෂ්ටිය ලැබේ`,
      source_graha_id:a.source_graha_id,target_graha_id:input.targetGrahaId,
      house_offset:a.house_offset,is_special:a.is_special,rule_version:a.rule_version,
    });
 }
 return modifiers;
}
