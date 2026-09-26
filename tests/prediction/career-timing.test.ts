/// <reference lib="deno.ns" />
import { combineCareerTiming } from "../../lib/prediction/timing/career-timing.ts";

Deno.test("Natal + Dasha + Transit convergence yields active strong timing",()=>{
 const r=combineCareerTiming({themeCode:"FOREIGN_LINKED_CAREER",natalLevel:"STRONG",dasha:{status:"ACTIVE",activation_level:"STRONG"},transit:{status:"TRIGGERED",activation_level:"MODERATE"}});
 if(r.status!=="ACTIVE_NOW"||r.level!=="STRONG")throw new Error("timing convergence missing");
});
Deno.test("Transit alone cannot replace dormant Dasha activation",()=>{
 const r=combineCareerTiming({themeCode:"FOREIGN_LINKED_CAREER",natalLevel:"STRONG",dasha:{status:"DORMANT",activation_level:"NONE"},transit:{status:"TRIGGERED",activation_level:"STRONG"}});
 if(r.status!=="TRANSIT_ONLY"||r.level!=="MODERATE")throw new Error("transit overpromoted dormant natal theme");
});
Deno.test("Dasha active without transit is waiting for trigger",()=>{
 const r=combineCareerTiming({themeCode:"FOREIGN_LINKED_CAREER",natalLevel:"STRONG",dasha:{status:"ACTIVE",activation_level:"MODERATE"},transit:{status:"UNTRIGGERED",activation_level:"NONE"}});
 if(r.status!=="DASHA_ACTIVE_WAITING_TRIGGER"||r.level!=="MODERATE")throw new Error("Dasha-only timing state changed");
});
