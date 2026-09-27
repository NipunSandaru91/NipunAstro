/// <reference lib="deno.ns" />

import { placementModifiers } from "../../lib/prediction/modifiers/placement.ts";

Deno.test("Jupiter exalted in Cancer creates supporting dignity modifier",()=>{
  const m=placementModifiers({grahaId:5,rasiId:4,bhava:1});
  if(!m.some(x=>x.code==="EXALTATION"&&x.polarity==="SUPPORTING"))throw new Error("Jupiter exaltation missing");
});

Deno.test("Saturn in Capricorn creates supporting own-sign modifier",()=>{
  const m=placementModifiers({grahaId:7,rasiId:10,bhava:7});
  if(!m.some(x=>x.code==="OWN_SIGN"&&x.polarity==="SUPPORTING"))throw new Error("Saturn own sign missing");
});

Deno.test("Mars in Gemini 12th creates dusthana contradiction without false dignity",()=>{
  const m=placementModifiers({grahaId:3,rasiId:3,bhava:12});
  if(!m.some(x=>x.code==="DUSTHANA_PLACEMENT"&&x.polarity==="CONTRADICTING"))throw new Error("dusthana modifier missing");
  if(m.some(x=>x.code==="OWN_SIGN"||x.code==="EXALTATION"||x.code==="DEBILITATION"))throw new Error("false Mars dignity");
});

Deno.test("Sun in Libra creates debilitation modifier",()=>{
  const m=placementModifiers({grahaId:1,rasiId:7,bhava:4});
  if(!m.some(x=>x.code==="DEBILITATION"&&x.polarity==="CONTRADICTING"))throw new Error("Sun debilitation missing");
});
