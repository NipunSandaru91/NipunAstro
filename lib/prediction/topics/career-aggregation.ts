import type { CareerCombination } from "./career-combinations.ts";
import type { EvidenceModifier,EvidenceStrength } from "../strength.ts";
type EvidenceBucket={ref:string;supporting:EvidenceModifier[];contradicting:EvidenceModifier[]};
export type AggregatedCareerTheme=CareerCombination&{level:EvidenceStrength;supporting:EvidenceModifier[];contradicting:EvidenceModifier[]};
export function aggregateCareerThemes(combinations:readonly CareerCombination[],buckets:readonly EvidenceBucket[]):AggregatedCareerTheme[]{
 return combinations.map(combo=>{
  const relevant=buckets.filter(b=>combo.evidence_refs.includes(b.ref));
  const supporting=relevant.flatMap(b=>b.supporting),contradicting=relevant.flatMap(b=>b.contradicting);
  const balance=supporting.length-contradicting.length;
  let level:EvidenceStrength;
  if(balance<=-2)level="WEAK";
  else if(combo.strength==="STRONG"&&balance>=1)level="STRONG";
  else if(combo.strength==="WEAK"&&balance<2)level="WEAK";
  else level="MODERATE";
  return {...combo,level,supporting,contradicting};
 });
}
