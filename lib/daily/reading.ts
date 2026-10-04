import {
  COLOR,
  GRAHA,
  NUMBER,
  RASI,
  RASI_LORD,
  WEEKDAY_LORD,
} from "./labels.ts";
import type { DeepDashaPeriod } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";

type Position = { graha_id: number; rasi_id: number };
export type DailyReadingInput = {
  lagna: number;
  positions: Position[];
  moonRasi: number;
  at: number;
  periods: DeepDashaPeriod[];
};
const FOCUS = [
  "ඔබේ ප්‍රමුඛ අවශ්‍යතාව හඳුනාගෙන එක කටයුත්තකින් දවස අරඹන්න.",
  "වියදම් සහ කතාබහට අවධානය දෙන්න; වැදගත් ගෙවීම් ලියා තබන්න.",
  "කල් දැමූ ඇමතුමක් හෝ කෙටි කටයුත්තක් නිම කිරීමට ඉඩ වෙන් කරන්න.",
  "නිවසේ සහ වැඩපොළේ පහසුව වැඩි කරන කුඩා වෙනසක් කරන්න.",
  "නිර්මාණශීලී වැඩකට හෝ ඉගෙනීමට බාධා නැති කාලයක් වෙන් කරන්න.",
  "වැඩ එකතු කරගැනීම වෙනුවට ඉතිරි කුඩා වගකීම් පිළිවෙළට අවසන් කරන්න.",
  "තනිව තීරණය කිරීමට පෙර අදාළ පුද්ගලයාගේ අදහසත් අසන්න.",
  "අපැහැදිලි එකඟතාවක් හෝ හවුල් වියදමක් නැවත පරීක්ෂා කරන්න.",
  "දිගුකාලීන අරමුණකට අද කළ හැකි ඉගෙනීමේ පියවරක් තෝරන්න.",
  "ඔබෙන් බලාපොරොත්තු වන ප්‍රතිඵලය පැහැදිලි කර ප්‍රමුඛ වැඩය නිම කරන්න.",
  "උදව් ඉල්ලීමට සහ කණ්ඩායම සමඟ සැලැස්මක් බෙදා ගැනීමට ඉඩ වෙන් කරන්න.",
  "අනවශ්‍ය වියදම් හා වැඩ බර අඩු කර විවේකයටත් ඉඩ තබන්න.",
];
const TOPICS = [
  {
    id: "finance",
    label: "මුදල් / අයවැය",
    houses: [2, 11],
    caution: [8, 12],
    active: "ලැබීම් සහ සැලසුම් කළ ගෙවීම් සමාලෝචනයට ප්‍රමුඛතාව දෙන්න.",
    quiet: "අද අයවැය සීමාවක් තබා අවශ්‍ය ගෙවීම් පිළිවෙළට කරන්න.",
    care: "හවුල් ගෙවීම්, ණය හෝ අනපේක්ෂිත වියදම් සම්බන්ධ කොන්දේසි නැවත කියවන්න.",
  },
  {
    id: "career",
    label: "රැකියාව / කටයුතු",
    houses: [3, 6, 10, 11],
    caution: [8, 12],
    active: "වැඩයේ ඉදිරි පියවර සහ අවසන් කළ යුතු දේ පැහැදිලිව සටහන් කරන්න.",
    quiet: "නව වැඩ ගොඩක් ගැනීමට පෙර තිබෙන වැඩක් නිම කරන්න.",
    care: "කාල සීමා සහ තොරතුරු දෙවරක් පරීක්ෂා කර අමතර ඉඩක් තබන්න.",
  },
  {
    id: "relationship",
    label: "සම්බන්ධතා",
    houses: [2, 5, 7, 11],
    caution: [6, 8, 12],
    active: "සවන් දීම සහ පොදු සැලැස්මක් සාකච්ඡා කිරීම සඳහා ඉඩ වෙන් කරන්න.",
    quiet: "කෙටි, අවංක කතාබහක් සහ අන් අයගේ සීමාවන්ට ගරු කිරීම වැදගත්ය.",
    care: "ක්ෂණික ප්‍රතිචාරයකට පෙර විරාමයක් ගන්න; නොදන්නා අදහස් අනුමාන නොකරන්න.",
  },
];
const house = (lagna: number, rasi: number) => (rasi - lagna + 12) % 12 + 1;
/** Editorial V1: qualitative emphasis, not calibrated probability or auspiciousness.
 * Moon house + natal positions of active V2 MD/AD lords; no synthetic daily scores.
 */
export function buildDailyReading(input: DailyReadingInput) {
  if (
    !Number.isInteger(input.lagna) || input.lagna < 1 || input.lagna > 12 ||
    !Number.isInteger(input.moonRasi) || input.moonRasi < 1 ||
    input.moonRasi > 12 || !Number.isFinite(input.at)
  ) throw Error("INVALID_READING_INPUT");
  const moonHouse = house(input.lagna, input.moonRasi);
  const active = input.periods.filter((p) =>
    p.level <= 2 && Date.parse(p.start_at) <= input.at &&
    input.at < Date.parse(p.end_at)
  );
  const timing = active.map((p) => ({
    lord: p.graha_id,
    level: p.level,
    position: input.positions.find((g) => g.graha_id === p.graha_id),
  }));
  const lagnaLord = RASI_LORD[input.lagna - 1];
  return {
    ruleVersion: "DAILY_READING_V1",
    moonHouse,
    lagnaLord,
    summary: `${
      RASI[input.lagna - 1]
    } ලග්නයට අද චන්ද්‍රයා ${moonHouse} වැනි භාවයේ යෙදෙන පසුබිමෙන්, ${
      FOCUS[moonHouse - 1]
    }`,
    focus: FOCUS[moonHouse - 1],
    timing: timing.length === 2
      ? timing.map((t) => GRAHA[t.lord]).join(" → ")
      : "දශා දත්ත සම්පූර්ණ නැහැ",
    topics: TOPICS.map((topic) => {
      const matches = timing.filter((t) =>
        t.position &&
        topic.houses.includes(house(input.lagna, t.position.rasi_id))
      );
      const emphasized = topic.houses.includes(moonHouse) || matches.length > 0;
      const caution = topic.caution.includes(moonHouse);
      return {
        id: topic.id,
        label: topic.label,
        text: caution ? topic.care : emphasized ? topic.active : topic.quiet,
        evidence: [
          `චන්ද්‍ර ගෝචරය: ${moonHouse} භාවය`,
          ...matches.map((t) =>
            `${t.level === 1 ? "මහා දශා" : "අන්තර් දශා"} අධිපති ${
              GRAHA[t.lord]
            }: ජන්ම ${house(input.lagna, t.position!.rasi_id)} භාවය`
          ),
        ],
      };
    }),
  };
}
export function dailySymbols(weekday: number, lagna: number) {
  if (
    !Number.isInteger(weekday) || weekday < 0 || weekday > 6 ||
    !Number.isInteger(lagna) || lagna < 1 || lagna > 12
  ) throw Error("INVALID_SYMBOL_INPUT");
  const lords = [WEEKDAY_LORD[weekday], RASI_LORD[lagna - 1]];
  return {
    numbers: [...new Set(lords.map((g) => NUMBER[g]))],
    colors: [...new Set(lords.map((g) => COLOR[g]))],
  };
}
