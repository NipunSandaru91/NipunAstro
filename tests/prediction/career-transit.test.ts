/// <reference lib="deno.ns" />
import { careerTransitActivation } from "../../lib/prediction/timing/career-transit.ts";

const theme={code:"FOREIGN_LINKED_CAREER",level:"STRONG" as const,evidence_grahas:[3,4],evidence_houses:[10,12]};

Deno.test("transit through a theme evidence house creates a traceable trigger",()=>{
 const a=careerTransitActivation({lagnaRasiId:4,themes:[theme],transits:[{graha_id:5,rasi_id:1},{graha_id:7,rasi_id:3}]})[0];
 if(a.status!=="TRIGGERED"||a.activation_level!=="STRONG")throw new Error("multi-trigger transit activation missing");
 if(a.triggers.length!==2)throw new Error("transit trigger trace lost");
});

Deno.test("single relevant transit trigger is moderate",()=>{
 const a=careerTransitActivation({lagnaRasiId:4,themes:[theme],transits:[{graha_id:5,rasi_id:1}]})[0];
 if(a.status!=="TRIGGERED"||a.activation_level!=="MODERATE")throw new Error("single transit trigger classification changed");
});

Deno.test("unrelated transit leaves natal theme untriggered",()=>{
 const a=careerTransitActivation({lagnaRasiId:4,themes:[theme],transits:[{graha_id:2,rasi_id:5}]})[0];
 if(a.status!=="UNTRIGGERED"||a.activation_level!=="NONE"||a.natal_level!=="STRONG")throw new Error("natal promise changed by unrelated transit");
});
