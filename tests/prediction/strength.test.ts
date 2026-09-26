/// <reference lib="deno.ns" />

import { assessEvidenceStrength } from "../../lib/prediction/strength.ts";

Deno.test("evidence strength starts moderate without modifiers", () => {
  const result=assessEvidenceStrength([]);
  if(result.level!=="MODERATE"||result.supporting.length||result.contradicting.length)throw new Error("neutral strength contract changed");
});

Deno.test("supporting and contradicting modifiers remain independently traceable", () => {
  const result=assessEvidenceStrength([
    {code:"OWN_SIGN",polarity:"SUPPORTING",text_si:"ග්‍රහයා ස්වක්ෂේත්‍රයේ පිහිටයි"},
    {code:"DUSTHANA_PLACEMENT",polarity:"CONTRADICTING",text_si:"දුෂ්ථාන භාවයක පිහිටයි"},
  ]);
  if(result.level!=="MODERATE")throw new Error("balanced modifiers must remain moderate");
  if(result.supporting[0]?.code!=="OWN_SIGN"||result.contradicting[0]?.code!=="DUSTHANA_PLACEMENT")throw new Error("modifier trace lost");
});

Deno.test("two net supporting modifiers raise qualitative strength and reverse lowers it", () => {
  const strong=assessEvidenceStrength([
    {code:"A",polarity:"SUPPORTING",text_si:"A"},
    {code:"B",polarity:"SUPPORTING",text_si:"B"},
  ]);
  const weak=assessEvidenceStrength([
    {code:"A",polarity:"CONTRADICTING",text_si:"A"},
    {code:"B",polarity:"CONTRADICTING",text_si:"B"},
  ]);
  if(strong.level!=="STRONG"||weak.level!=="WEAK")throw new Error("qualitative strength thresholds changed");
});
