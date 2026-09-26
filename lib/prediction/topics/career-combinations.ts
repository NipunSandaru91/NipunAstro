export type CareerIndicator={source_bhava:number;target_bhava:number;graha_id:number};
export type CareerCombination={
 code:"FOREIGN_LINKED_CAREER";
 strength:"WEAK"|"MODERATE"|"STRONG";
 evidence_refs:string[];
 text_si:string;
 rule_version:"CAREER_COMBINATIONS_V1";
};
function ref(x:CareerIndicator){return `${x.source_bhava}L-${x.target_bhava}H-G${x.graha_id}`;}
export function careerCombinations(items:readonly CareerIndicator[]):CareerCombination[]{
 const refs:string[]=[];
 for(const x of items){
  if(x.source_bhava===10&&x.target_bhava===12)refs.push(ref(x));
  if((x.source_bhava===9||x.source_bhava===12)&&(x.target_bhava===9||x.target_bhava===12||x.target_bhava===1))refs.push(ref(x));
 }
 if(!refs.length)return [];
 const unique=[...new Set(refs)];
 return [{
  code:"FOREIGN_LINKED_CAREER",
  strength:unique.length>=2?"STRONG":"WEAK",
  evidence_refs:unique,
  text_si:unique.length>=2?"වෘත්තීය ක්ෂේත්‍රය විදේශ හෝ දුරස්ථ සම්බන්ධතා සමඟ බැඳීමට ස්වාධීන ජන්ම සාධක කිහිපයක් සහාය දක්වයි":"විදේශ සම්බන්ධ වෘත්තීය තේමාවකට එක් ජන්ම සාධකයක් පමණක් පෙනේ",
  rule_version:"CAREER_COMBINATIONS_V1",
 }];
}
