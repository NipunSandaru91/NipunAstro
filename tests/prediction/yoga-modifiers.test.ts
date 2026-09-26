/// <reference lib="deno.ns" />
import { yogaEvidenceModifiers } from "../../lib/prediction/modifiers/yoga.ts";

Deno.test("formed Yoga evaluation becomes traceable supporting evidence",()=>{
 const m=yogaEvidenceModifiers([{rule_code:"HAMSA",formation_status:"FORMED",strength:"PRIMARY",engine_version:"YOGA_ENGINE_V1"}]);
 if(m.length!==1||m[0].code!=="YOGA_FORMED_HAMSA"||m[0].polarity!=="SUPPORTING")throw new Error("formed yoga evidence missing");
 if(m[0].rule_version!=="YOGA_ENGINE_V1")throw new Error("yoga version lost");
});
Deno.test("not-formed Yoga does not become negative prediction evidence",()=>{
 const m=yogaEvidenceModifiers([{rule_code:"HAMSA",formation_status:"NOT_FORMED",strength:"NONE",engine_version:"YOGA_ENGINE_V1"}]);
 if(m.length!==0)throw new Error("absence of yoga must not become contradiction");
});
