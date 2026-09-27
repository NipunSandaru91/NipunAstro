import { isDusthana, planetSignCondition } from "../../../supabase/functions/jyotisha-calculator/core/yoga.ts";
import type { EvidenceModifier } from "../strength.ts";

const DEBILITATION:Record<number,number>={1:7,2:8,3:4,4:12,5:10,6:6,7:1};

export function placementModifiers(input:{grahaId:number;rasiId:number;bhava:number}):EvidenceModifier[]{
  const modifiers:EvidenceModifier[]=[];
  const dignity=planetSignCondition(input.grahaId,input.rasiId);
  if(dignity==="EXALTATION")modifiers.push({code:"EXALTATION",polarity:"SUPPORTING",text_si:"ග්‍රහයා උච්ච රාශියේ පිහිටයි"});
  if(dignity==="OWN")modifiers.push({code:"OWN_SIGN",polarity:"SUPPORTING",text_si:"ග්‍රහයා ස්වක්ෂේත්‍රයේ පිහිටයි"});
  if(DEBILITATION[input.grahaId]===input.rasiId)modifiers.push({code:"DEBILITATION",polarity:"CONTRADICTING",text_si:"ග්‍රහයා නීච රාශියේ පිහිටයි"});
  if(isDusthana(input.bhava))modifiers.push({code:"DUSTHANA_PLACEMENT",polarity:"CONTRADICTING",text_si:"ග්‍රහයා දුෂ්ථාන භාවයක පිහිටයි"});
  return modifiers;
}
