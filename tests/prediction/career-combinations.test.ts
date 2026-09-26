/// <reference lib="deno.ns" />
import { careerCombinations } from "../../lib/prediction/topics/career-combinations.ts";

Deno.test("foreign-linked career requires multiple independent natal indicators",()=>{
 const r=careerCombinations([
  {source_bhava:10,target_bhava:12,graha_id:3},
  {source_bhava:9,target_bhava:9,graha_id:5},
  {source_bhava:12,target_bhava:1,graha_id:4},
 ]);
 const x=r.find(v=>v.code==="FOREIGN_LINKED_CAREER");
 if(!x||x.strength!=="STRONG"||x.evidence_refs.length<2)throw new Error("foreign career convergence missing");
});
Deno.test("single 10th-lord-to-12th indicator is not promoted to strong conclusion",()=>{
 const r=careerCombinations([{source_bhava:10,target_bhava:12,graha_id:3}]);
 const x=r.find(v=>v.code==="FOREIGN_LINKED_CAREER");
 if(!x||x.strength!=="WEAK")throw new Error("single indicator overclaimed");
});
