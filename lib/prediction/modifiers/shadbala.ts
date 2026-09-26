import { assertClassicalGraha } from "../../../supabase/functions/jyotisha-calculator/core/shadbala.ts";
import type { EvidenceModifier } from "../strength.ts";

export type ShadbalaModifier=EvidenceModifier&{
 graha_id:number;
 total_bala_rupa:number;
 minimum_rupa:number;
 rule_version:"SHADBALA_MODIFIER_V1";
};

export function shadbalaModifier(input:{grahaId:number;totalBalaRupa:number;minimumRupa:number}):ShadbalaModifier{
 assertClassicalGraha(input.grahaId);
 if(!Number.isFinite(input.totalBalaRupa))throw new Error("total_bala_rupa must be finite");
 if(!Number.isFinite(input.minimumRupa)||input.minimumRupa<=0)throw new Error("minimum_rupa must be positive");
 const above=input.totalBalaRupa>=input.minimumRupa;
 return {
  code:above?"SHADBALA_ABOVE_MINIMUM":"SHADBALA_BELOW_MINIMUM",
  polarity:above?"SUPPORTING":"CONTRADICTING",
  text_si:above?"ෂඩ්බලය නියමිත අවම මට්ටමට සමාන හෝ ඉහළය":"ෂඩ්බලය නියමිත අවම මට්ටමට වඩා පහළය",
  graha_id:input.grahaId,total_bala_rupa:input.totalBalaRupa,minimum_rupa:input.minimumRupa,
  rule_version:"SHADBALA_MODIFIER_V1",
 };
}
