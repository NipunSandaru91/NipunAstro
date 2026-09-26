/// <reference lib="deno.ns" />
import { shadbalaMinimumRupa, SHADBALA_THRESHOLD_VERSION } from "../../lib/prediction/shadbala-thresholds.ts";

Deno.test("locks BPHS Shadbala minimum Rupa table",()=>{
 const expected=[6.5,6,5,7,6.5,5.5,5];
 expected.forEach((v,i)=>{if(shadbalaMinimumRupa(i+1)!==v)throw new Error("threshold changed for graha "+(i+1));});
 if(SHADBALA_THRESHOLD_VERSION!=="BPHS_6_5_SUN_V1")throw new Error("threshold version changed");
});
Deno.test("Shadbala threshold excludes nodes",()=>{
 for(const id of [0,8,9]){let failed=false;try{shadbalaMinimumRupa(id)}catch{failed=true}if(!failed)throw new Error("invalid graha accepted");}
});
