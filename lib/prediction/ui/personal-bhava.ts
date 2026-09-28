import { allBhavas, houseFromRasi } from "../../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import { bhavaQualitySi, grahaQualitySi, rasiQualitySi } from "../qualities.ts";
import { placementModifiers } from "../modifiers/placement.ts";
import { shadbalaModifier } from "../modifiers/shadbala.ts";

export type PersonalBhavaCard = {
  bhava: number;
  title_si: string;
  keywords_si: string[];
  rasi_name_si: string;
  graha_names_si: string[];
  description_si: string;
  main_theme_si: string;
};

type Position = { graha_id: number; rasi_id: number };
type ShadbalaRow = { graha_id: number; total_bala_rupa: number };

const TITLES = [
  "ස්වභාවය සහ ජීවන දිශාව",
  "ධනය, පවුල සහ වචනය",
  "ධෛර්යය සහ සන්නිවේදනය",
  "නිවස සහ අභ්‍යන්තර සුවය",
  "බුද්ධිය සහ නිර්මාණශීලීත්වය",
  "සේවය සහ දෛනික අභියෝග",
  "විවාහය සහ හවුල්කාරිත්වය",
  "පරිවර්තනය සහ හවුල් සම්පත්",
  "උසස් දැනුම සහ ධර්මය",
  "වෘත්තිය සහ ප්‍රසිද්ධ කාර්යභාරය",
  "ලාභ, ජාල සහ අභිලාෂ",
  "විදේශ, විරාමය සහ අභ්‍යන්තර ජීවිතය",
] as const;

const PRACTICAL = [
  "තමන්ගේ ශක්ති හඳුනාගෙන ස්ථාවර අනන්‍යතාවක් ගොඩනැගීම මෙහි ප්‍රයෝජනවත් වේ.",
  "ආදායම පමණක් නොව සම්පත් පවත්වාගැනීම සහ වචනයේ වටිනාකමද වැදගත් වේ.",
  "ඉගෙනීම, ලිවීම, කතා කිරීම සහ නිර්භීත කුඩා ක්‍රියා මෙම ක්ෂේත්‍රය වර්ධනය කරයි.",
  "ආරක්ෂිත නිවසක් සහ මනසට විවේක දෙන පෞද්ගලික අවකාශයක් ගොඩනැගීම වැදගත් වේ.",
  "කුතුහලය, අධ්‍යයනය සහ නිර්මාණාත්මක ප්‍රකාශනයට නිතර ඉඩ දීම ප්‍රයෝජනවත් වේ.",
  "ක්‍රමවත් දිනචරියාව, සේවා හැකියාව සහ ගැටලු පියවරෙන් පියවර විසඳීම වැදගත් වේ.",
  "සීමා, එකඟතා සහ දෙපාර්ශ්වයටම ගරු කරන සන්නිවේදනය සම්බන්ධතා ශක්තිමත් කරයි.",
  "වෙනස්කම් පාලනය කිරීමට වඩා ඒවා තේරුම්ගෙන සම්පත් සහ විශ්වාසය සැලසුම් කිරීම වැදගත් වේ.",
  "ගැඹුරු අධ්‍යයනය, ගුරු මඟපෙන්වීම සහ පුළුල් දෘෂ්ටිකෝණ සමඟ සම්බන්ධ වීම ප්‍රයෝජනවත් වේ.",
  "ඉක්මන් ප්‍රතිඵලයට වඩා දක්ෂතාව, ප්‍රතිපත්තිය සහ දිගුකාලීන වෘත්තීය දිශාව එකට ගැළපීම වැදගත් වේ.",
  "නිවැරදි ජාල, දිගුකාලීන ඉලක්ක සහ ප්‍රයෝජනවත් සහයෝගීතා ලාභයට මාර්ග විවෘත කරයි.",
  "විවේකය, පසුබිම් වැඩ සහ අවශ්‍ය නොවන දේ අත්හැරීම සඳහා සැලසුම් කළ අවකාශයක් තබාගැනීම වැදගත් වේ.",
] as const;

function joinKeywords(values: readonly string[]) {
  if (values.length <= 1) return values[0] ?? "";
  return values.slice(0, -1).join(", ") + " සහ " + values[values.length - 1];
}

function toneText(supporting: number, contradicting: number) {
  if (supporting > contradicting) {
    return "මෙහි පවතින සාධක මෙම ක්ෂේත්‍රයේ හැකියාවන් ක්‍රමයෙන් ප්‍රකාශ කිරීමට සාපේක්ෂව සහායක රටාවක් පෙන්වයි.";
  }
  if (contradicting > supporting) {
    return "මෙම ක්ෂේත්‍රයේ ප්‍රතිඵල ඉක්මනින් නොව, ඉවසීම, පුහුණුව සහ හොඳ තීරණ මගින් වඩා පැහැදිලිව ගොඩනැගිය හැකි රටාවක් පෙන්වයි.";
  }
  return "මෙය එක පැත්තකට පමණක් බර නොවන රටාවක් බැවින්, ඔබේ තේරීම් සහ පුරුදු ප්‍රතිඵලයේ ගුණාත්මකභාවයට විශාල බලපෑමක් කරයි.";
}

export function buildPersonalBhavaCards(input: {
  lagnaRasiId: number;
  positions: readonly Position[];
  shadbala?: readonly ShadbalaRow[];
}): PersonalBhavaCard[] {
  const bhavas = allBhavas(input.lagnaRasiId);

  return bhavas.map((row) => {
    const bhava = bhavaQualitySi(row.bhava);
    const rasi = rasiQualitySi(row.rasi_id);
    const occupants = input.positions.filter((p) => p.rasi_id === row.rasi_id);
    const lordPosition = input.positions.find((p) => p.graha_id === row.lord_graha_id);
    if (!lordPosition) throw new Error(`PERSONAL_BHAVA_LORD_POSITION_MISSING_${row.bhava}`);

    const lord = grahaQualitySi(row.lord_graha_id);
    const targetHouse = houseFromRasi(input.lagnaRasiId, lordPosition.rasi_id);
    const target = bhavaQualitySi(targetHouse);
    const modifiers = placementModifiers({
      grahaId: row.lord_graha_id,
      rasiId: lordPosition.rasi_id,
      bhava: targetHouse,
    });

    const shad = input.shadbala?.find((x) => x.graha_id === row.lord_graha_id);
    if (shad) modifiers.push(shadbalaModifier({ grahaId: row.lord_graha_id, totalBalaRupa: shad.total_bala_rupa }));

    const supporting = modifiers.filter((m) => m.polarity === "SUPPORTING").length;
    const contradicting = modifiers.filter((m) => m.polarity === "CONTRADICTING").length;
    const occupantNames = occupants.map((p) => grahaQualitySi(p.graha_id).name_si);
    const occupantKeywords = [...new Set(occupants.flatMap((p) => grahaQualitySi(p.graha_id).keywords_si))].slice(0, 4);

    const sentences = [
      `මෙම භාවය ${joinKeywords(bhava.keywords_si)} සම්බන්ධ ඔබේ ජීවන අත්දැකීම් ප්‍රධාන වශයෙන් විස්තර කරයි.`,
      `${rasi.name_si} රාශියේ ස්වභාවය නිසා මෙහි ${joinKeywords(rasi.keywords_si)} යන ගුණ හරහා දේවල් ප්‍රකාශ වීමට නැඹුරුවක් ඇත.`,
      `මෙම ක්ෂේත්‍රයේ පාලක රටාව ${joinKeywords(lord.keywords_si.slice(0, 3))} සමඟ සම්බන්ධ වන නිසා, සිතුවිලි පමණක් නොව ඒවා ක්‍රියාවට ගෙන යන ආකාරයද වැදගත් වේ.`,
      `එහි ජීවන සම්බන්ධතාව ${joinKeywords(target.keywords_si)} යන තේමා සමඟ බැඳී ඇති නිසා, එක් ක්ෂේත්‍රයක තීරණ තවත් ක්ෂේත්‍රයක ප්‍රතිඵලයට බලපාන රටාවක් තිබිය හැක.`,
      occupants.length
        ? `මෙම භාවයේ ${occupantNames.join(" සහ ")} සම්බන්ධ බලපෑම නිසා ${joinKeywords(occupantKeywords)} වැනි ගුණ මෙහි වඩා සෘජුව දැනෙන්නට පුළුවන්.`
        : "මෙම භාවයේ සෘජු ග්‍රහ පිහිටීමක් නොමැති වුවද, එය අක්‍රිය භාවයක් නොවේ; එහි ප්‍රතිඵල පාලක රටාව සහ සම්බන්ධ ජීවන තේමා හරහා ක්‍රියා කරයි.",
      occupants.length > 1
        ? "එකම ක්ෂේත්‍රයට බලපෑම් කිහිපයක් එකතු වන නිසා, මෙය සරල එකම ගුණයකට වඩා ගතික සහ බහුපාර්ශ්වීය අත්දැකීමක් විය හැක."
        : "මෙහි ප්‍රතිඵල එකම සිදුවීමකින් තීරණය නොවී, කාලයත් සමඟ නැවත නැවත ගන්නා තීරණ සහ පුරුදු හරහා පැහැදිලි වේ.",
      toneText(supporting, contradicting),
      PRACTICAL[row.bhava - 1],
      "මෙය නියත සිදුවීමක් පිළිබඳ ප්‍රකාශයක් නොව, ජන්ම කේන්දරයේ සාම්ප්‍රදායික ජ්‍යෝතිෂ සාධක එකට සම්බන්ධ කර කියවන ප්‍රවණතා විස්තරයකි.",
    ];

    return {
      bhava: row.bhava,
      title_si: TITLES[row.bhava - 1],
      keywords_si: [...bhava.keywords_si],
      rasi_name_si: rasi.name_si,
      graha_names_si: occupantNames,
      description_si: sentences.join(" "),
      main_theme_si: `${bhava.keywords_si[0]} · ${rasi.keywords_si[0]} · ${target.keywords_si[0]}`,
    };
  });
}
