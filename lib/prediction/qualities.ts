export type GrahaQuality = { name_si: string; keywords_si: readonly string[] };
export type RasiQuality = {
  name_si: string;
  element_si: "අග්නි" | "පෘථිවි" | "වායු" | "ජල";
  lord_graha_id: number;
  keywords_si: readonly string[];
};
export type BhavaQuality = { bhava: number; keywords_si: readonly string[] };

const GRAHA: Record<number, GrahaQuality> = {
  1: { name_si: "රවි", keywords_si: ["අධිකාරය", "ආත්ම ප්‍රකාශනය", "නායකත්වය"] },
  2: { name_si: "චන්ද්‍ර", keywords_si: ["මනස", "හැඟීම්", "පෝෂණය"] },
  3: { name_si: "කුජ", keywords_si: ["ක්‍රියාශීලීත්වය", "ධෛර්යය", "තරඟකාරීත්වය", "තාක්ෂණික ක්‍රියාව"] },
  4: { name_si: "බුධ", keywords_si: ["බුද්ධිය", "සන්නිවේදනය", "ගණනය", "වෙළඳාම"] },
  5: { name_si: "ගුරු", keywords_si: ["දැනුම", "ප්‍රඥාව", "ධර්මය", "උසස් අධ්‍යාපනය"] },
  6: { name_si: "සිකුරු", keywords_si: ["සම්බන්ධතා", "සෞන්දර්යය", "සැපය", "වටිනාකම්"] },
  7: { name_si: "ශනි", keywords_si: ["විනය", "වගකීම", "ප්‍රමාදය", "ව්‍යුහය"] },
  8: { name_si: "රාහු", keywords_si: ["විස්තාරය", "අසාමාන්‍යත්වය", "ආශාව", "සීමා ඉක්මවීම"] },
  9: { name_si: "කේතු", keywords_si: ["වෙන්වීම", "අභ්‍යන්තර සෙවීම", "විමුක්ති නැඹුරුව"] },
};

const RASI: Record<number, RasiQuality> = {
  1:{name_si:"මේෂ",element_si:"අග්නි",lord_graha_id:3,keywords_si:["ආරම්භය","ක්‍රියාව","ස්වාධීනත්වය"]},
  2:{name_si:"වෘෂභ",element_si:"පෘථිවි",lord_graha_id:6,keywords_si:["ස්ථාවරත්වය","සම්පත්","වටිනාකම්"]},
  3:{name_si:"මිථුන",element_si:"වායු",lord_graha_id:4,keywords_si:["සන්නිවේදනය","තොරතුරු","ඉගෙනීම","විවිධත්වය"]},
  4:{name_si:"කටක",element_si:"ජල",lord_graha_id:2,keywords_si:["පෝෂණය","ආරක්ෂාව","අභ්‍යන්තර අත්දැකීම"]},
  5:{name_si:"සිංහ",element_si:"අග්නි",lord_graha_id:1,keywords_si:["ප්‍රකාශනය","නායකත්වය","නිර්මාණශීලීත්වය"]},
  6:{name_si:"කන්‍යා",element_si:"පෘථිවි",lord_graha_id:4,keywords_si:["විශ්ලේෂණය","සේවය","නිවැරදිභාවය"]},
  7:{name_si:"තුලා",element_si:"වායු",lord_graha_id:6,keywords_si:["සමතුලිතතාව","සම්බන්ධතා","ගිවිසුම්"]},
  8:{name_si:"වෘශ්චික",element_si:"ජල",lord_graha_id:3,keywords_si:["ගැඹුර","පරිවර්තනය","රහස්"]},
  9:{name_si:"ධනු",element_si:"අග්නි",lord_graha_id:5,keywords_si:["දර්ශනය","ගමන්","උසස් දැනුම"]},
  10:{name_si:"මකර",element_si:"පෘථිවි",lord_graha_id:7,keywords_si:["ව්‍යුහය","වගකීම","දිගුකාලීන ප්‍රයත්නය"]},
  11:{name_si:"කුම්භ",element_si:"වායු",lord_graha_id:7,keywords_si:["සමාජය","ජාල","නවෝත්පාදනය"]},
  12:{name_si:"මීන",element_si:"ජල",lord_graha_id:5,keywords_si:["අධ්‍යාත්මිකත්වය","අනුකම්පාව","සීමා දියවීම"]},
};

const BHAVA: Record<number, BhavaQuality> = {
  1:{bhava:1,keywords_si:["ස්වභාවය","ශරීරය","ජීවන දිශාව"]},
  2:{bhava:2,keywords_si:["ධනය","පවුල","වචනය"]},
  3:{bhava:3,keywords_si:["ධෛර්යය","සන්නිවේදනය","සහෝදරයන්"]},
  4:{bhava:4,keywords_si:["නිවස","මව","අභ්‍යන්තර සුවපහසුව"]},
  5:{bhava:5,keywords_si:["බුද්ධිය","නිර්මාණශීලීත්වය","දරුවන්"]},
  6:{bhava:6,keywords_si:["සේවය","රෝග","ණය","තරඟ"]},
  7:{bhava:7,keywords_si:["විවාහය","හවුල්කාරිත්වය","ගිවිසුම්"]},
  8:{bhava:8,keywords_si:["පරිවර්තනය","රහස්","හවුල් සම්පත්"]},
  9:{bhava:9,keywords_si:["ධර්මය","උසස් අධ්‍යාපනය","දිගු ගමන්"]},
  10:{bhava:10,keywords_si:["වෘත්තිය","කර්මය","ප්‍රසිද්ධ කාර්යභාරය"]},
  11:{bhava:11,keywords_si:["ලාභ","ජාල","අභිලාෂ"]},
  12:{bhava:12,keywords_si:["විදේශ","වියදම්","වෙන්වීම","පසුබිම් කටයුතු"]},
};

function get<T>(catalog: Record<number,T>, id:number, label:string):T {
  const value=catalog[id];
  if (!value) throw new Error(`unknown ${label} id: ${id}`);
  return value;
}
export const grahaQualitySi=(id:number)=>get(GRAHA,id,"graha");
export const rasiQualitySi=(id:number)=>get(RASI,id,"rasi");
export const bhavaQualitySi=(id:number)=>get(BHAVA,id,"bhava");
