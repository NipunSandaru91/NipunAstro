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
  "ස්වභාවය සහ ජීවන දිශාව","ධනය, පවුල සහ වචනය","ධෛර්යය සහ සන්නිවේදනය",
  "නිවස සහ අභ්‍යන්තර සුවය","බුද්ධිය සහ නිර්මාණශීලීත්වය","සේවය සහ දෛනික අභියෝග",
  "විවාහය සහ හවුල්කාරිත්වය","පරිවර්තනය සහ හවුල් සම්පත්","උසස් දැනුම සහ ධර්මය",
  "වෘත්තිය සහ සමාජ භූමිකාව","ලාභ, ජාල සහ අභිලාෂ","විදේශ, විරාමය සහ අභ්‍යන්තර ජීවිතය",
] as const;

const OPENERS = [
  "ඔබේ ස්වභාවය, ඔබ ලෝකයට පෙනෙන ආකාරය සහ ජීවිතය ආරම්භ කරන මූලික ශක්තිය මෙම භාවයෙන් කියවයි.",
  "ධනය, පවුල, කථන රටාව සහ ඔබ වටිනාකමක් දෙන දේවල් මෙම භාවයේ ප්‍රධාන තේමා වේ.",
  "තමන්ගේ උත්සාහය, ධෛර්යය, සන්නිවේදනය සහ කුඩා පියවරෙන් ඉදිරියට යන ආකාරය මෙම භාවයෙන් පෙන්වයි.",
  "නිවස, අභ්‍යන්තර ආරක්ෂාව, පවුල් පදනම සහ මනසට සුවපහසුව ලැබෙන ආකාරය මෙම භාවයට සම්බන්ධ වේ.",
  "බුද්ධිය, ඉගෙනීම, නිර්මාණශීලී ප්‍රකාශනය සහ තමන්ගේ අදහස් නිර්මාණයක් බවට පත් කරන ආකාරය මෙහි ප්‍රධාන වේ.",
  "දෛනික වැඩ, සේවය, තරඟකාරී තත්ත්ව, වගකීම් සහ ගැටලු කළමනාකරණය කරන ආකාරය මෙම භාවයෙන් කියවයි.",
  "විවාහය, දිගුකාලීන සම්බන්ධතා, හවුල්කාරිත්වය සහ එකඟතා ගොඩනගන ආකාරය මෙම භාවයේ මූලික තේමාවයි.",
  "ගැඹුරු වෙනස්කම්, විශ්වාසය, හවුල් සම්පත් සහ පාලනය කළ නොහැකි වෙනස්කම් සමඟ කටයුතු කරන ආකාරය මෙහි පෙන්වයි.",
  "උසස් අධ්‍යාපනය, දර්ශනය, ධර්මය, දිගු ගමන් සහ ජීවිතයට පුළුල් අර්ථයක් සොයන ආකාරය මෙම භාවයෙන් කියවයි.",
  "වෘත්තීය ජීවිතය, සමාජ භූමිකාව, වගකීම් සහ ඔබේ හැකියාව ලෝකයට ප්‍රකාශ කරන ආකාරය මෙම භාවයේ ප්‍රධාන තේමාවයි.",
  "ලාභ, දිගුකාලීන අරමුණු, මිතුරු හා වෘත්තීය ජාල සහ ඔබේ උත්සාහයෙන් ලැබෙන ප්‍රතිඵල මෙම භාවයෙන් කියවයි.",
  "විදේශ සම්බන්ධතා, පසුබිම් වැඩ, විවේකය, වියදම් සහ අභ්‍යන්තර ජීවිතයට ඉඩ දෙන ආකාරය මෙම භාවයේ තේමා වේ.",
] as const;

const PRACTICAL = [
  "තමන්ගේ ශක්ති හඳුනාගෙන ස්ථාවර අනන්‍යතාවක් ගොඩනැගීම මෙහි ප්‍රයෝජනවත් වේ.",
  "ආදායම උපයාගැනීමත් සම්පත් රැකගැනීමත් දෙකම එකම වැදගත්කමකින් සැලකීම වඩා ප්‍රයෝජනවත් වේ.",
  "ඉගෙනීම, ලිවීම, කතා කිරීම සහ නිර්භීත කුඩා ක්‍රියා නිතර කිරීම මෙම ක්ෂේත්‍රය වර්ධනය කරයි.",
  "ආරක්ෂිත නිවසක් සහ මනසට විවේක දෙන පෞද්ගලික අවකාශයක් ගොඩනැගීම වැදගත් වේ.",
  "කුතුහලය, අධ්‍යයනය සහ නිර්මාණාත්මක ප්‍රකාශනයට නිතර ඉඩ දීම ප්‍රයෝජනවත් වේ.",
  "ක්‍රමවත් දිනචරියාව, සේවා හැකියාව සහ ගැටලු පියවරෙන් පියවර විසඳීම වැදගත් වේ.",
  "සීමා, එකඟතා සහ දෙපාර්ශ්වයටම ගරු කරන සන්නිවේදනය සම්බන්ධතා ශක්තිමත් කරයි.",
  "වෙනස්කම් පාලනය කිරීමට වඩා ඒවා තේරුම්ගෙන සම්පත් සහ විශ්වාසය සැලසුම් කිරීම වැදගත් වේ.",
  "ගැඹුරු අධ්‍යයනය, ගුරු මඟපෙන්වීම සහ පුළුල් දෘෂ්ටිකෝණ සමඟ සම්බන්ධ වීම ප්‍රයෝජනවත් වේ.",
  "වෘත්තීය සාර්ථකත්වයට ඉක්මන් ක්‍රියාකාරිත්වය සහ දිගුකාලීන සැලසුම අතර සමතුලිතතාවය තබාගැනීම වැදගත් වේ.",
  "නිවැරදි ජාල, දිගුකාලීන ඉලක්ක සහ ප්‍රයෝජනවත් සහයෝගීතා ලාභයට මාර්ග විවෘත කරයි.",
  "විවේකය, පසුබිම් වැඩ සහ අවශ්‍ය නොවන දේ අත්හැරීම සඳහා සැලසුම් කළ අවකාශයක් තබාගැනීම වැදගත් වේ.",
] as const;

function join(values: readonly string[]) {
  if (values.length === 1) return values[0];
  return values.slice(0, -1).join(", ") + " සහ " + values[values.length - 1];
}

function toneText(supporting: number, contradicting: number) {
  if (supporting > contradicting) return "මෙහි සහායක සාධක වැඩි බැවින්, නිවැරදි තීරණ සහ අඛණ්ඩ උත්සාහය සමඟ මෙම ක්ෂේත්‍රයේ හැකියාවන් පැහැදිලිව ප්‍රකාශ විය හැක.";
  if (contradicting > supporting) return "මෙහි අභියෝගකාරී සාධකද ඇති බැවින්, ප්‍රතිඵල ඉක්මන් කිරීමකට වඩා ඉවසීම, පුහුණුව සහ සැලසුම් සහිත තීරණ වඩා වැදගත් වේ.";
  return "මෙහි සහාය සහ අභියෝග දෙකම මිශ්‍රව පෙනෙන නිසා, ඔබේ තේරීම්, පුරුදු සහ කාලය භාවිතා කරන ආකාරය ප්‍රතිඵලයට විශාල බලපෑමක් කරයි.";
}

function careerDetail(input: {
  rasiId: number;
  rasiName: string;
  rasiKeywords: readonly string[];
  occupants: readonly number[];
  occupantNames: readonly string[];
  lordName: string;
  lordRasiName: string;
  targetHouse: number;
  targetKeywords: readonly string[];
  supporting: number;
  contradicting: number;
}) {
  const hasMercury = input.occupants.includes(4);
  const hasVenus = input.occupants.includes(6);
  const targetIs12 = input.targetHouse === 12;
  const lordInGemini = input.lordRasiName === "මිථුන";

  const expression = input.rasiId === 1
    ? "මේෂ රාශියේ බලපෑම නිසා ස්වාධීනව සිතීම, ඉක්මනින් ආරම්භ කිරීම සහ අදහසක් ක්‍රියාවට පත් කිරීම වෘත්තීය රටාවේ වැදගත් කොටසක් විය හැක."
    : `${input.rasiName} රාශියේ ${join(input.rasiKeywords)} ගුණ නිසා ඔබේ වෘත්තීය ප්‍රකාශනය එම ගුණ හරහා වඩා පැහැදිලි විය හැක.`;

  const occupants = input.occupants.length
    ? `මෙම භාවයේ ${join(input.occupantNames)} පිහිටීම නිසා ඔවුන් නියෝජනය කරන හැකියාවන් වෘත්තීය සහ සමාජ භූමිකාවට සෘජුව සම්බන්ධ වේ.`
    : "මෙම භාවයේ සෘජු ග්‍රහ පිහිටීමක් නැති වුවද, භාව අධිපතිගේ පිහිටීම වෘත්තීය දිශාව කියවීමට ප්‍රධාන සාධකය වේ.";

  const skillLine = hasMercury && hasVenus
    ? "විශේෂයෙන් සන්නිවේදනය, අදහස් ඉදිරිපත් කිරීම, නිර්මාණශීලීත්වය, design, client-facing work හෝ consulting වැනි වැඩ සමඟ ගැළපීමක් පෙන්විය හැක."
    : hasMercury
      ? "සන්නිවේදනය, තොරතුරු, ගණනය, වෙළඳාම හෝ අදහස් පැහැදිලිව ඉදිරිපත් කරන වැඩ මෙහි වැදගත් හැකියාවන් විය හැක."
      : hasVenus
        ? "සම්බන්ධතා, සෞන්දර්යය, design, වටිනාකම් හෝ මිනිසුන් සමඟ සම්බන්ධ වන වැඩ මෙහි වැදගත් හැකියාවන් විය හැක."
        : "වෘත්තීය දිශාව තීරණය කිරීමේදී භාව අධිපති සහ එය සම්බන්ධ වන ජීවන ක්ෂේත්‍රය වැඩි බරක් ගනී.";

  const lordLine = `10 වන භාවයේ අධිපති ${input.lordName} ${input.targetHouse} වන භාවයට සම්බන්ධ වන නිසා, වෘත්තිය ${join(input.targetKeywords)} යන තේමා සමඟ බැඳෙන්නට පුළුවන්.`;
  const foreignLine = targetIs12
    ? `එම සම්බන්ධතාව නිසා විදේශ සම්බන්ධතා, remote/online work, ආයතනයක පසුබිම් කටයුතු හෝ තනිව අවධානය යොමු කරන වැඩ වෘත්තීය ජීවිතයේ කොටසක් විය හැක.`
    : `ඒ නිසා වෘත්තීය තීරණ සහ ${join(input.targetKeywords)} සම්බන්ධ ජීවන තීරණ එකිනෙකට බලපාන රටාවක් තිබිය හැක.`;
  const communicationLine = targetIs12 && lordInGemini
    ? "අධිපති මිථුන රාශියට සම්බන්ධ වීම නිසා communication, information, online coordination හෝ විවිධ කාර්යයන් අතර සම්බන්ධක භූමිකාවක්ද වැදගත් විය හැක."
    : `${input.lordRasiName} රාශියේ අධිපති පිහිටීම වෘත්තීය ගමනට තවත් ${input.lordRasiName} ස්වභාවයේ ප්‍රකාශන රටාවක් එක් කරයි.`;

  return [
    "වෘත්තීය ජීවිතය ඔබේ හැකියාවන් ලෝකයට පෙන්වන සහ සමාජ භූමිකාව ගොඩනගන ප්‍රධාන ක්ෂේත්‍රයකි.",
    expression, occupants, skillLine, lordLine, foreignLine, communicationLine,
    toneText(input.supporting, input.contradicting),
    PRACTICAL[9],
  ].join(" ");
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
    const lordRasi = rasiQualitySi(lordPosition.rasi_id);
    const targetHouse = houseFromRasi(input.lagnaRasiId, lordPosition.rasi_id);
    const target = bhavaQualitySi(targetHouse);
    const modifiers = placementModifiers({ grahaId: row.lord_graha_id, rasiId: lordPosition.rasi_id, bhava: targetHouse });
    const shad = input.shadbala?.find((x) => x.graha_id === row.lord_graha_id);
    if (shad) modifiers.push(shadbalaModifier({ grahaId: row.lord_graha_id, totalBalaRupa: shad.total_bala_rupa }));

    const supporting = modifiers.filter((m) => m.polarity === "SUPPORTING").length;
    const contradicting = modifiers.filter((m) => m.polarity === "CONTRADICTING").length;
    const occupantNames = occupants.map((p) => grahaQualitySi(p.graha_id).name_si);
    const occupantKeywords = [...new Set(occupants.flatMap((p) => grahaQualitySi(p.graha_id).keywords_si))].slice(0, 4);

    let description: string;
    if (row.bhava === 10) {
      description = careerDetail({
        rasiId: row.rasi_id,
        rasiName: rasi.name_si,
        rasiKeywords: rasi.keywords_si,
        occupants: occupants.map((p) => p.graha_id),
        occupantNames,
        lordName: lord.name_si,
        lordRasiName: lordRasi.name_si,
        targetHouse,
        targetKeywords: target.keywords_si,
        supporting,
        contradicting,
      });
    } else {
      description = [
        OPENERS[row.bhava - 1],
        `${rasi.name_si} රාශියේ ${join(rasi.keywords_si)} ගුණ නිසා මෙම ජීවන ක්ෂේත්‍රය එම ස්වභාවයෙන් ප්‍රකාශ වීමට නැඹුරුවක් ඇත.`,
        `මෙම භාවයේ අධිපති ${lord.name_si} වන අතර, එය ${join(lord.keywords_si.slice(0, 3))} යන ගුණ මෙම ක්ෂේත්‍රයට සම්බන්ධ කරයි.`,
        `භාව අධිපති ${targetHouse} වන භාවයට සම්බන්ධ වන නිසා, ${join(target.keywords_si)} යන ජීවන තේමා මෙහි ප්‍රතිඵල සමඟ එකිනෙකට බැඳෙන්නට පුළුවන්.`,
        occupants.length
          ? `මෙම භාවයේ ${join(occupantNames)} පිහිටීම නිසා ${join(occupantKeywords)} වැනි ගුණ මෙහි වඩා සෘජුව ප්‍රකාශ විය හැක.`
          : "මෙම භාවයේ සෘජු ග්‍රහ පිහිටීමක් නැති වුවද එය අක්‍රිය නොවේ; අධිපතිගේ පිහිටීම සහ සම්බන්ධ භාවය හරහා එහි ප්‍රතිඵල ක්‍රියා කරයි.",
        occupants.length > 1
          ? "බලපෑම් කිහිපයක් එකම භාවයට එකතු වන නිසා, මෙම ක්ෂේත්‍රයේ අත්දැකීම් එකම රටාවකට සීමා නොවී බහුපාර්ශ්වීය විය හැක."
          : "මෙම ක්ෂේත්‍රයේ ප්‍රතිඵල එකම සිදුවීමකින් තීරණය නොවී, කාලයත් සමඟ ගන්නා තීරණ සහ පුරුදු හරහා පැහැදිලි විය හැක.",
        toneText(supporting, contradicting),
        PRACTICAL[row.bhava - 1],
        "මෙය නියත සිදුවීමක් කියන අනාවැකියක් නොව, ජන්ම කේන්දරයේ සම්බන්ධ සාධක එකට ගෙන කියවන ප්‍රවණතා විස්තරයකි.",
      ].join(" ");
    }

    return {
      bhava: row.bhava,
      title_si: TITLES[row.bhava - 1],
      keywords_si: [...bhava.keywords_si],
      rasi_name_si: rasi.name_si,
      graha_names_si: occupantNames,
      description_si: description,
      main_theme_si: `${bhava.keywords_si[0]} · ${rasi.keywords_si[0]} · ${target.keywords_si[0]}`,
    };
  });
}
