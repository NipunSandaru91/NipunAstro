import { bhavaQualitySi, grahaQualitySi, rasiQualitySi } from "../qualities.ts";

export type PersonalNatureReading = {
  lagnaLabel: string;
  overview: string;
  drivingPattern: string;
  emotionalPattern: string;
  balanceNote: string;
};

type Input = {
  lagnaRasiId: number;
  positions: Array<{ graha_id: number; rasi_id: number }>;
};

const ELEMENT_BALANCE: Record<string, string> = {
  අග්නි: "ඔබේ උද්යෝගය ඉක්මන් තීරණයකට හැරෙන විට මොහොතක් නවතිලා ප්‍රතිඵලය සසඳා බලන්න.",
  පෘථිවි: "ඔබ ගොඩනගන ස්ථාවරත්වය වටිනා නමුත්, අවශ්‍ය වෙලාවට ක්‍රමය වෙනස් කිරීමටත් ඉඩ තබන්න.",
  වායු: "අදහස් සහ සම්බන්ධතා බහුල වන විට, එකවර කරන දේ සීමා කර ප්‍රධාන ඉලක්කයට අවධානය දෙන්න.",
  ජල: "අන් අයගේ හැඟීම් හොඳින් දැනෙන ගුණය ඔබට ශක්තියක්; ඒ සමඟ ඔබේම අවශ්‍යතා සහ සීමාත් පැහැදිලි කරගන්න.",
};

function houseFromRasi(lagnaRasiId: number, rasiId: number) {
  return ((rasiId - lagnaRasiId + 12) % 12) + 1;
}

export function buildPersonalNatureReading(input: Input): PersonalNatureReading {
  const lagna = rasiQualitySi(input.lagnaRasiId);
  const lordId = lagna.lord_graha_id;
  const lordPosition = input.positions.find((position) => position.graha_id === lordId);
  const moonPosition = input.positions.find((position) => position.graha_id === 2);

  if (!lordPosition) throw new Error("PERSONAL_NATURE_LAGNA_LORD_POSITION_MISSING");
  if (!moonPosition) throw new Error("PERSONAL_NATURE_MOON_POSITION_MISSING");

  const lord = grahaQualitySi(lordId);
  const lordRasi = rasiQualitySi(lordPosition.rasi_id);
  const lordBhava = houseFromRasi(input.lagnaRasiId, lordPosition.rasi_id);
  const lordBhavaQuality = bhavaQualitySi(lordBhava);
  const moonRasi = rasiQualitySi(moonPosition.rasi_id);

  const overview = `${lagna.name_si} ලග්නයේ ${lagna.keywords_si.slice(0, 2).join(" සහ ")} ගුණ ඔබේ මුල් ප්‍රතිචාරයට පසුබිමක් සපයයි. ඒ සමඟ, ඔබේ ලග්නාධිපති ${lord.name_si} ${lordRasi.name_si} රාශියේ ${lordBhava} වන භාවයේ සිටීම නිසා, එම ස්වභාවය ${lordBhavaQuality.keywords_si.slice(0, 2).join(" සහ ")} වැනි ජීවන අවස්ථා හරහා වැඩිපුර ප්‍රකාශ විය හැකියි.`;
  const drivingPattern = `ඔබව ඇතුළතින් මෙහෙයවන ${lord.keywords_si.slice(0, 2).join(" සහ ")} ගුණ, ${lordRasi.keywords_si.slice(0, 2).join(" සහ ")} ආකාරයෙන් ක්‍රියාත්මක වේ. ඒ නිසා තීරණයක් ගන්නා විට ${lordBhavaQuality.keywords_si[0]} පිළිබඳ අත්දැකීම් ඔබේ තේරීම්වලට විශේෂ බරක් දෙන්නට පුළුවන්.`;
  const emotionalPattern = `චන්ද්‍රයා ${moonRasi.name_si} රාශියේ පිහිටීමෙන්, ඔබේ මනස ${moonRasi.keywords_si.slice(0, 2).join(" සහ ")} හරහා අත්දැකීම් සැකසීමට නැඹුරු බවක් පෙනේ. පීඩනයකදී ඔබට වඩාත් හොඳින් සිතීමට උපකාර වන්නේ මේ රටාව හඳුනාගෙන ඔබට ගැළපෙන විවේකයක් හෝ කතාබහක් තෝරාගැනීමයි.`;
  const balanceNote = ELEMENT_BALANCE[lagna.element_si];

  return {
    lagnaLabel: `${lagna.name_si} ලග්නය`,
    overview,
    drivingPattern,
    emotionalPattern,
    balanceNote,
  };
}
