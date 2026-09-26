/// <reference lib="deno.ns" />
import { lordRelationshipEvidence } from "../../lib/prediction/rules/lord-relationship.ts";
const positions=[{graha_id:3,rasi_id:3},{graha_id:4,rasi_id:1},{graha_id:6,rasi_id:1},{graha_id:7,rasi_id:10}];

Deno.test("Golden Chart derives 3rd and 4th lords as Mercury-Venus conjunction in 10th",()=>{
 const r=lordRelationshipEvidence({lagnaRasiId:4,houseA:3,houseB:4,positions,topic:"CAREER",polarity:"SUPPORTING"});
 if(r.lord_a_graha_id!==4||r.lord_b_graha_id!==6||r.relationship!=="CONJUNCTION")throw new Error("lord relationship changed");
 if(r.rasi_id!==1||r.bhava!==10)throw new Error("lord relationship location changed");
});
Deno.test("unrelated lords return no relationship rather than fabricated evidence",()=>{
 const r=lordRelationshipEvidence({lagnaRasiId:4,houseA:10,houseB:7,positions,topic:"CAREER",polarity:"SUPPORTING"});
 if(r.relationship!=="NONE")throw new Error("false lord relationship");
});
