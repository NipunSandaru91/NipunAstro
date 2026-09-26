import { assertClassicalGraha } from "../../../supabase/functions/jyotisha-calculator/core/shadbala.ts";
import type { EvidenceModifier } from "../strength.ts";
import { shadbalaMinimumRupa, SHADBALA_THRESHOLD_VERSION } from "../shadbala-thresholds.ts";

export type ShadbalaModifier=EvidenceModifier&{
 graha_id:number;
 total_bala_rupa:number;
 minimum_rupa:number;
 rule_version:"SHADBALA_MODIFIER_V1";
 threshold_version:typeof SHADBALA_THRESHOLD_VERSION;
};

export function shadbalaModifier(input:{grahaId:number;totalBalaRupa:number;minimumRupa?:number}):ShadbalaModifier{
 assertClassicalGraha(input.grahaId);
 if(!Number.isFinite(input.totalBalaRupa))throw new Error("total_bala_rupa must be finite");
 const minimumRupa=input.minimumRupa??shadbalaMinimumRupa(input.grahaId);
 if(!Number.isFinite(minimumRupa)||minimumRupa<=0)throw new Error("minimum_rupa must be positive");
 const above=input.totalBalaRupa>=minimumRupa;
 return {
  code:above?"SHADBALA_ABOVE_MINIMUM":"SHADBALA_BELOW_MINIMUM",
  polarity:above?"SUPPORTING":"CONTRADICTING",
  text_si:above?"ෂඩ්බලය නියමිත අවම මට්ටමට සමාන හෝ ඉහළය":"ෂඩ්බලය නියමිත අවම මට්ටමට වඩා පහළය",
  graha_id:input.grahaId,total_bala_rupa:input.totalBalaRupa,minimum_rupa:minimumRupa,
  rule_version:"SHADBALA_MODIFIER_V1",threshold_version:SHADBALA_THRESHOLD_VERSION,
 };
}
