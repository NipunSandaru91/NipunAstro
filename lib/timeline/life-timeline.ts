import type { DeepDashaPeriod } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
import {
  allBhavas,
  houseFromRasi,
} from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import { GRAHA } from "../daily/labels.ts";

export const TIMELINE_VERSION = "LIFE_THEMES_V1";
const YEAR = 365.25 * 86400000;
const TOPICS = [
  {
    id: "learning",
    label: "ඉගෙනීම / පුහුණුව",
    houses: [4, 5, 9],
    age: 0,
    text: "ඉගෙනීමේ පරිසරය, පුහුණුවක් හෝ මඟපෙන්වීමක් සම්බන්ධ වෙනස්කම්",
    question: "අලුත් අධ්‍යාපන පියවරක්, ගුරුවරයෙකුගේ බලපෑමක් හෝ පුහුණුවක් තිබුණාද?",
  },
  {
    id: "work",
    label: "රැකියාව / වගකීම්",
    houses: [6, 10, 11],
    age: 16,
    text: "වැඩ භාරය, රැකියා මාර්ගය හෝ කණ්ඩායම් වගකීම් නැවත සකස් කිරීම",
    question: "රැකියාව, වැඩ භාරය හෝ වෘත්තීය අරමුණේ වැදගත් වෙනසක් තිබුණාද?",
  },
  {
    id: "relationships",
    label: "සම්බන්ධතා / පවුල",
    houses: [2, 5, 7],
    age: 0,
    text: "පවුලේ හෝ සමීප සම්බන්ධතාවල භූමිකා සහ එකඟතා වෙනස් වීම",
    question: "පවුලේ හෝ සමීප සම්බන්ධතාවක වගකීම්/එකඟතා වෙනස් වුණාද?",
  },
  {
    id: "money",
    label: "මුදල් / සම්පත්",
    houses: [2, 8, 11],
    age: 16,
    text: "ලැබීම්, හවුල් සම්පත් හෝ මුදල් සැලැස්ම නැවත සලකා බැලීම",
    question: "ආදායම, විශාල වියදමක් හෝ හවුල් මුදල් වගකීමක් වෙනස් වුණාද?",
  },
  {
    id: "home",
    label: "නිවස / පරිසරය",
    houses: [4, 9, 12],
    age: 0,
    text: "නිවස, පවුලෙන් දුරස්වීම හෝ හුරුපුරුදු පරිසරයේ වෙනස්කම්",
    question: "පදිංචිය, පවුලේ පරිසරය හෝ දුරස්ව ජීවත්වීමේ අත්දැකීමක් වෙනස් වුණාද?",
  },
  {
    id: "inner",
    label: "අභ්‍යන්තර වෙනස",
    houses: [1, 8, 12],
    age: 12,
    text: "පෞද්ගලික ප්‍රමුඛතා, විවේකය හෝ ජීවිත අරමුණ නැවත විමසීම",
    question: "ඔබගේ ප්‍රමුඛතා, ජීවිත දැක්ම හෝ අධ්‍යාත්මික ගවේෂණය වෙනස් වුණාද?",
  },
] as const;
export type TimelineInput = {
  lagna: number;
  positions: { graha_id: number; rasi_id: number }[];
  birthAt: string;
  asOf: string;
  periods: readonly DeepDashaPeriod[];
};
export type TimelineItem = {
  id: string;
  topic: string;
  label: string;
  text: string;
  question: string;
  startAt: string;
  endAt: string;
  dasha: DeepDashaPeriod[];
  refinement: DeepDashaPeriod[];
  evidence: string[];
  signals: number;
};
export function canViewTimeline(accountType: unknown) {
  return accountType === "PROFESSIONAL";
}

/** Evidence prominence only, not event probability or a claim of empirical validation.
 * Complete PD windows, rank by MD/AD/PD natal house links (weights 3/2/1),
 * require >=2 distinct linked lords, one theme per PD, max 2 per AD / 4 per topic.
 * Then sort chronologically. Current/incomplete PD excluded from both histories.
 * Levels 4/5 give a representative linked subwindow, never an event-time estimate.
 */
export function buildLifeTimeline(input: TimelineInput) {
  const birth = Date.parse(input.birthAt),
    now = Date.parse(input.asOf),
    until = now + 10 * YEAR;
  if (!Number.isFinite(birth) || !Number.isFinite(now) || now < birth) {
    throw Error("INVALID_TIMELINE_CLOCK");
  }
  if (!Number.isInteger(input.lagna) || input.lagna < 1 || input.lagna > 12) {
    throw Error("INVALID_LAGNA");
  }
  const positions = new Map(
    input.positions.map((p) => [p.graha_id, p.rasi_id]),
  );
  if (
    positions.size !== 9 ||
    Array.from({ length: 9 }, (_, i) => i + 1).some((id) =>
      !positions.has(id)
    ) ||
    input.positions.some((p) =>
      !Number.isInteger(p.rasi_id) || p.rasi_id < 1 || p.rasi_id > 12
    )
  ) throw Error("INCOMPLETE_NATAL_DATA");
  const houses = allBhavas(input.lagna);
  const byPath = new Map(input.periods.map((p) => [p.path, p]));
  const children = new Map<string, DeepDashaPeriod[]>();
  for (const period of input.periods) {
    if (period.parent_path) {
      const group = children.get(period.parent_path) ?? [];
      group.push(period);
      children.set(period.parent_path, group);
    }
  }
  const links = (lord: number, targets: readonly number[]) => {
    const occupied = houseFromRasi(input.lagna, positions.get(lord)!);
    const ruled = houses.filter((h) => h.lord_graha_id === lord).map((h) =>
      h.bhava
    );
    return {
      occupied,
      ruled,
      linked: targets.includes(occupied) ||
        ruled.some((h) => targets.includes(h)),
    };
  };
  const candidates: {
    item: TimelineItem;
    score: number;
    ad: string;
    side: "past" | "future";
  }[] = [];
  for (const pd of input.periods.filter((p) => p.level === 3)) {
    const start = Date.parse(pd.start_at), end = Date.parse(pd.end_at);
    if (
      start < birth || end <= start ||
      !(end <= now || (start >= now && end <= until))
    ) continue;
    const ad = byPath.get(pd.parent_path!),
      md = ad && byPath.get(ad.parent_path!);
    if (!md || !ad) throw Error("INCOMPLETE_DASHA_CHAIN");
    const chain = [md, ad, pd];
    for (const topic of TOPICS) {
      if ((start - birth) / YEAR < topic.age) continue;
      const matched = chain.filter((p) =>
        links(p.graha_id, topic.houses).linked
      );
      const distinct = [...new Set(matched.map((p) => p.graha_id))];
      if (distinct.length < 2) continue;
      const score = matched.reduce((total, p) => total + 4 - p.level, 0);
      const evidence = distinct.map((lord) => {
        const link = links(lord, topic.houses);
        return `${GRAHA[lord]}: ජන්ම ${link.occupied} භාවය; ${
          link.ruled.length
            ? link.ruled.join(" / ") + " භාව අධිපති"
            : "රාශි අධිපතිත්වයක් යොදා නැත"
        }`;
      });
      const choose = (parent: string) =>
        [...(children.get(parent) ?? [])].sort((a, b) =>
          Number(links(b.graha_id, topic.houses).linked) -
            Number(links(a.graha_id, topic.houses).linked) ||
          a.start_at.localeCompare(b.start_at)
        )[0];
      const sukshma = choose(pd.path), prana = sukshma && choose(sukshma.path);
      candidates.push({
        score,
        ad: ad.path,
        side: end <= now ? "past" : "future",
        item: {
          id: `${pd.path}:${topic.id}`,
          topic: topic.id,
          label: topic.label,
          text: topic.text,
          question: topic.question,
          startAt: pd.start_at,
          endAt: pd.end_at,
          dasha: chain,
          refinement: [sukshma, prana].filter((p): p is DeepDashaPeriod =>
            Boolean(p)
          ),
          evidence,
          signals: distinct.length,
        },
      });
    }
  }
  function select(side: "past" | "future") {
    const chosen: TimelineItem[] = [],
      seen = new Set<string>(),
      adCounts = new Map<string, number>(),
      topicCounts = new Map<string, number>(),
      eraCounts = new Map<number, number>();
    const from = side === "past" ? birth : now,
      to = side === "past" ? now : until;
    for (
      const c of candidates.filter((c) => c.side === side).sort((a, b) =>
        b.score - a.score || b.item.signals - a.item.signals ||
        a.item.startAt.localeCompare(b.item.startAt) ||
        a.item.topic.localeCompare(b.item.topic)
      )
    ) {
      const pd = c.item.dasha[2].path;
      const era = Math.min(
        4,
        Math.floor((Date.parse(c.item.startAt) - from) / (to - from) * 5),
      );
      if (
        seen.has(pd) || (adCounts.get(c.ad) ?? 0) >= 2 ||
        (topicCounts.get(c.item.topic) ?? 0) >= 4 ||
        (eraCounts.get(era) ?? 0) >= 2
      ) continue;
      chosen.push(c.item);
      seen.add(pd);
      adCounts.set(c.ad, (adCounts.get(c.ad) ?? 0) + 1);
      topicCounts.set(c.item.topic, (topicCounts.get(c.item.topic) ?? 0) + 1);
      eraCounts.set(era, (eraCounts.get(era) ?? 0) + 1);
      if (chosen.length === 10) break;
    }
    return chosen.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }
  return {
    version: TIMELINE_VERSION,
    asOf: input.asOf,
    birthAt: input.birthAt,
    until: new Date(until).toISOString(),
    past: select("past"),
    future: select("future"),
    ongoing: input.periods.filter((p) =>
      p.level === 3 && Date.parse(p.start_at) <= now &&
      now < Date.parse(p.end_at)
    ),
  };
}
