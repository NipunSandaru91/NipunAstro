export type EvidenceStrength="WEAK"|"MODERATE"|"STRONG";
export type EvidenceModifier={
  code:string;
  polarity:"SUPPORTING"|"CONTRADICTING";
  text_si:string;
};
export type EvidenceStrengthAssessment={
  level:EvidenceStrength;
  supporting:EvidenceModifier[];
  contradicting:EvidenceModifier[];
};

export function assessEvidenceStrength(modifiers:readonly EvidenceModifier[]):EvidenceStrengthAssessment{
  const supporting=modifiers.filter((m)=>m.polarity==="SUPPORTING");
  const contradicting=modifiers.filter((m)=>m.polarity==="CONTRADICTING");
  const balance=supporting.length-contradicting.length;
  const level:EvidenceStrength=balance>=2?"STRONG":balance<=-2?"WEAK":"MODERATE";
  return {level,supporting,contradicting};
}
