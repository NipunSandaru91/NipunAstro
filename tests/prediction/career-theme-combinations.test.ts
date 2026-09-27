/// <reference lib="deno.ns" />
import { careerCombinations } from "../../lib/prediction/topics/career-combinations.ts";

Deno.test("business theme requires career/income lord evidence converging on angular or gain houses",()=>{
 const r=careerCombinations([
  {source_bhava:10,target_bhava:12,graha_id:3},
  {source_bhava:2,target_bhava:10,graha_id:1},
  {source_bhava:11,target_bhava:10,graha_id:6},
 ]);
 const x=r.find(v=>v.code==="BUSINESS_INDEPENDENT_EARNING");
 if(!x||x.strength!=="STRONG"||x.evidence_refs.length<2)throw new Error("business convergence missing");
});

Deno.test("communication technical career needs Mercury/Mars career-linked evidence",()=>{
 const r=careerCombinations([
  {source_bhava:10,target_bhava:12,graha_id:3},
  {source_bhava:2,target_bhava:10,graha_id:4},
 ]);
 const x=r.find(v=>v.code==="COMMUNICATION_TECHNICAL_CAREER");
 if(!x||x.strength!=="STRONG")throw new Error("communication technical convergence missing");
});

Deno.test("one Mercury indicator remains weak rather than a job-title claim",()=>{
 const r=careerCombinations([{source_bhava:2,target_bhava:10,graha_id:4}]);
 const x=r.find(v=>v.code==="COMMUNICATION_TECHNICAL_CAREER");
 if(!x||x.strength!=="WEAK")throw new Error("single Mercury indicator overclaimed");
});
