/// <reference lib="deno.ns" />
import { careerDashaActivation } from "../../lib/prediction/timing/career-dasha.ts";

const themes=[{code:"FOREIGN_LINKED_CAREER",level:"STRONG",evidence_grahas:[3,4]}] as const;

Deno.test("career Dasha activates natal theme when Mahadasha lord is in its evidence chain",()=>{
 const a=careerDashaActivation({themes,mahadasaGrahaId:3,antardasaGrahaId:5});
 if(a[0].status!=="ACTIVE"||a[0].activation_level!=="MODERATE")throw new Error("Mahadasha activation missing");
 if(a[0].matched_lords.join(",")!=="3")throw new Error("matched lord trace lost");
});

Deno.test("Mahadasha and Antardasha convergence strengthens activation",()=>{
 const a=careerDashaActivation({themes,mahadasaGrahaId:3,antardasaGrahaId:4});
 if(a[0].activation_level!=="STRONG"||a[0].matched_lords.length!==2)throw new Error("Dasha convergence missing");
});

Deno.test("unrelated Dasha does not erase natal promise",()=>{
 const a=careerDashaActivation({themes,mahadasaGrahaId:7,antardasaGrahaId:2});
 if(a[0].status!=="DORMANT"||a[0].natal_level!=="STRONG")throw new Error("natal promise was incorrectly changed");
});
