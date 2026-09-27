export type BhavaPredictionStatus="CAREER_V1"|"FOUNDATION_ONLY";
export type BhavaOverviewRow={
  bhava:number;
  rasi_id:number;
  graha_ids:number[];
  title_si:string;
  keywords_si:string[];
  prediction_status:BhavaPredictionStatus;
};

const TITLE_SI=[
  "තනුව / ස්වභාවය","ධනය / පවුල / වචනය","ධෛර්යය / සන්නිවේදනය","නිවස / මව / අභ්‍යන්තර සුවය",
  "අධ්‍යාපනය / බුද්ධිය / දරුවන්","සේවය / රෝග / තරඟ","විවාහය / සම්බන්ධතා","පරිවර්තනය / ගුප්ත කරුණු",
  "උසස් අධ්‍යාපනය / ධර්මය / ගුරු","වෘත්තිය / තත්ත්වය / කර්ම","ආදායම් / ලාභ / ජාල","විදේශ / වියදම් / වෙන්වීම"
] as const;
const KEYWORDS=[
 ["ශරීරය","ස්වභාවය","ජීවන දිශාව"],["ධනය","පවුල","වචනය"],["ධෛර්යය","සන්නිවේදනය","සහෝදර"],["නිවස","මව","මානසික සුවය"],
 ["අධ්‍යාපනය","නිර්මාණශීලීත්වය","දරුවන්"],["සේවය","රෝග","තරඟ"],["විවාහය","partnership","සම්බන්ධතා"],["පරිවර්තනය","ගුප්ත","අනපේක්ෂිත වෙනස්කම්"],
 ["උසස් දැනුම","ධර්මය","දිගු ගමන්"],["වෘත්තිය","තත්ත්වය","ක්‍රියා"],["ලාභ","ආදායම්","network"],["විදේශ","වියදම්","වෙන්වීම"]
] as const;

function validId(value:number,min:number,max:number,name:string){
  if(!Number.isInteger(value)||value<min||value>max)throw new Error(`${name} must be ${min}-${max}`);
}
export function buildBhavaOverview(input:{lagnaRasiId:number;positions:readonly {graha_id:number;rasi_id:number}[];careerEvidenceBhavas:readonly number[]}):BhavaOverviewRow[]{
  validId(input.lagnaRasiId,1,12,"lagnaRasiId");
  const career=new Set(input.careerEvidenceBhavas);
  return Array.from({length:12},(_,i)=>{
    const bhava=i+1;
    const rasi_id=((input.lagnaRasiId-1+i)%12)+1;
    const graha_ids=input.positions.filter(p=>p.rasi_id===rasi_id).map(p=>p.graha_id);
    return {
      bhava,rasi_id,graha_ids,
      title_si:TITLE_SI[i],
      keywords_si:[...KEYWORDS[i]],
      prediction_status:career.has(bhava)?"CAREER_V1":"FOUNDATION_ONLY",
    };
  });
}
