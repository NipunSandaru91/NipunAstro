export type CareerIndicator={source_bhava:number;target_bhava:number;graha_id:number};
export type CareerCombination={
 code:"FOREIGN_LINKED_CAREER"|"BUSINESS_INDEPENDENT_EARNING"|"COMMUNICATION_TECHNICAL_CAREER";
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
 const out:CareerCombination[]=[];
 const unique=[...new Set(refs)];
 if(unique.length)out.push({
  code:"FOREIGN_LINKED_CAREER",
  strength:unique.length>=2?"STRONG":"WEAK",
  evidence_refs:unique,
  text_si:unique.length>=2?"වෘත්තීය ක්ෂේත්‍රය විදේශ හෝ දුරස්ථ සම්බන්ධතා සමඟ බැඳීමට ස්වාධීන ජන්ම සාධක කිහිපයක් සහාය දක්වයි":"විදේශ සම්බන්ධ වෘත්තීය තේමාවකට එක් ජන්ම සාධකයක් පමණක් පෙනේ",
  rule_version:"CAREER_COMBINATIONS_V1",
 });
 const business=[...new Set(items.filter(x=>(x.source_bhava===2||x.source_bhava===11)&&(x.target_bhava===1||x.target_bhava===10||x.target_bhava===11)).map(ref))];
 if(business.length)out.push({code:"BUSINESS_INDEPENDENT_EARNING",strength:business.length>=2?"STRONG":"WEAK",evidence_refs:business,text_si:business.length>=2?"ආදායම් හා ලාභ භාව අධිපති සම්බන්ධතා ස්වාධීන ආදායම් හෝ ව්‍යාපාර තේමාවකට එකිනෙක සහාය දක්වයි":"ස්වාධීන ආදායම් තේමාවකට එක් සාධකයක් පමණක් පෙනේ",rule_version:"CAREER_COMBINATIONS_V1"});
 const technical=[...new Set(items.filter(x=>(x.graha_id===3||x.graha_id===4)&&(x.source_bhava===10||x.target_bhava===10||x.source_bhava===2)).map(ref))];
 if(technical.length)out.push({code:"COMMUNICATION_TECHNICAL_CAREER",strength:technical.length>=2?"STRONG":"WEAK",evidence_refs:technical,text_si:technical.length>=2?"බුධ/කුජ සම්බන්ධ වෘත්තීය සාධක සන්නිවේදන හා තාක්ෂණික ක්‍රියාකාරකම් තේමාවකට එකිනෙක සහාය දක්වයි":"සන්නිවේදන හෝ තාක්ෂණික වෘත්තීය තේමාවකට එක් සාධකයක් පමණක් පෙනේ",rule_version:"CAREER_COMBINATIONS_V1"});
 return out;
}
