import type { EvidenceModifier } from "../strength.ts";
type YogaRow={rule_code:string;formation_status:"FORMED"|"NOT_FORMED";strength:"PRIMARY"|"NONE";engine_version:"YOGA_ENGINE_V1"};
export type YogaEvidenceModifier=EvidenceModifier&{yoga_rule_code:string;yoga_strength:"PRIMARY";rule_version:"YOGA_ENGINE_V1"};
export function yogaEvidenceModifiers(rows:readonly YogaRow[]):YogaEvidenceModifier[]{
 return rows.filter((r)=>r.formation_status==="FORMED"&&r.strength==="PRIMARY").map((r)=>({
  code:`YOGA_FORMED_${r.rule_code}`,polarity:"SUPPORTING" as const,
  text_si:`${r.rule_code} යෝගයේ සියලු formation conditions සපුරා ඇත`,
  yoga_rule_code:r.rule_code,yoga_strength:"PRIMARY" as const,rule_version:r.engine_version,
 }));
}
