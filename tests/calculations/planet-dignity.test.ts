/// <reference lib="deno.ns" />
import { planetSignCondition } from "../../supabase/functions/jyotisha-calculator/core/yoga.ts";

Deno.test("classical dignity map includes Sun and Moon",()=>{
  if(planetSignCondition(1,5)!=="OWN")throw new Error("Sun own sign Leo missing");
  if(planetSignCondition(1,1)!=="EXALTATION")throw new Error("Sun exaltation Aries missing");
  if(planetSignCondition(2,4)!=="OWN")throw new Error("Moon own sign Cancer missing");
  if(planetSignCondition(2,2)!=="EXALTATION")throw new Error("Moon exaltation Taurus missing");
});
