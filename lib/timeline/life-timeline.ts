import type { DeepDashaPeriod } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
import { allBhavas, houseFromRasi } from "../../supabase/functions/jyotisha-calculator/core/bhavas.ts";
import { GRAHA } from "../daily/labels.ts";

export const TIMELINE_VERSION = "TURNING_WINDOWS_V2";
const YEAR = 365.25 * 86400000;
const TOPICS = [
  { id: "learning", label: "ඉගෙනීම / පුහුණුව", houses: [4, 5, 9], age: 0, text: "අධ්‍යාපනය, පුහුණුව හෝ මඟපෙන්වීමේ වැදගත් මාරුවක් ගැන අවධානය යොමු විය හැකියි." },
  { id: "work", label: "රැකියාව / වගකීම්", houses: [6, 10, 11], age: 16, text: "රැකියා දිශාව, වගකීම් හෝ කණ්ඩායම් භූමිකාවේ සැලකිය යුතු මාරුවක් ගැන අවධානය යොමු විය හැකියි." },
  { id: "relationships", label: "සම්බන්ධතා / පවුල", houses: [2, 5, 7], age: 0, text: "පවුලේ හෝ සමීප සම්බන්ධතාවල භූමිකා සහ වගකීම් වෙනස් වීම ගැන අවධානය යොමු විය හැකියි." },
  { id: "money", label: "මුදල් / සම්පත්", houses: [2, 8, 11], age: 16, text: "ආදායම, හවුල් සම්පත් හෝ මුදල් වගකීම් නැවත සකස් වීම ගැන අවධානය යොමු විය හැකියි." },
  { id: "home", label: "නිවස / පරිසරය", houses: [4, 9, 12], age: 0, text: "පදිංචිය, පවුලේ පරිසරය හෝ දුරස්ව ජීවත්වීම සම්බන්ධ වෙනසක් ගැන අවධානය යොමු විය හැකියි." },
  { id: "inner", label: "අභ්‍යන්තර වෙනස", houses: [1, 8, 12], age: 12, text: "පුද්ගලික ප්‍රමුඛතා, ජීවන දැක්ම හෝ අභ්‍යන්තර සෙවීමේ වෙනසක් ගැන අවධානය යොමු විය හැකියි." },
] as const;

type Topic = Omit<typeof TOPICS[number], "houses"> & { houses: readonly number[] };
export type ImpactTone = "SUPPORTIVE" | "CHALLENGING" | "MIXED";
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
  startAt: string;
  endAt: string;
  dasha: DeepDashaPeriod[];
  evidence: string[];
  directionEvidence: string[];
  signals: number;
  evidenceStrength: "STRONG" | "MODERATE";
  tone: ImpactTone;
  toneLabel: string;
  impactLabel: string;
  interpretation: string;
};

export function canViewTimeline(accountType: unknown) {
  return accountType === "PROFESSIONAL";
}

const SUPPORTIVE_FUNCTIONAL_HOUSES: number[] = [1, 5, 9, 10, 11];
const CHALLENGING_FUNCTIONAL_HOUSES: number[] = [6, 8, 12];
const NATURAL_SUPPORTIVE: number[] = [5, 6]; // Jupiter, Venus
const NATURAL_CHALLENGING: number[] = [1, 3, 7, 8, 9]; // Sun, Mars, Saturn, Rahu, Ketu

function topicLink(houses: ReturnType<typeof allBhavas>, lagna: number, positions: Map<number, number>, lord: number, topic: Topic) {
  const occupied = houseFromRasi(lagna, positions.get(lord)!);
  const ruled = houses.filter((h) => h.lord_graha_id === lord).map((h) => h.bhava);
  const linkedRules = ruled.filter((h) => topic.houses.includes(h));
  return {
    occupied,
    ruled,
    linked: topic.houses.includes(occupied) || linkedRules.length > 0,
    direct: topic.houses.includes(occupied),
    linkedRules,
  };
}

function functionalTone(houses: ReturnType<typeof allBhavas>, lord: number) {
  const ruled = houses.filter((h) => h.lord_graha_id === lord).map((h) => h.bhava);
  const supportive = ruled.some((h) => SUPPORTIVE_FUNCTIONAL_HOUSES.includes(h));
  const challenging = ruled.some((h) => CHALLENGING_FUNCTIONAL_HOUSES.includes(h));
  return supportive === challenging ? 0 : supportive ? 1 : -1;
}

function lordTone(houses: ReturnType<typeof allBhavas>, lord: number) {
  const functional = functionalTone(houses, lord);
  const natural = NATURAL_SUPPORTIVE.includes(lord) ? 1 : NATURAL_CHALLENGING.includes(lord) ? -1 : 0;
  return functional * 2 + natural;
}

function describeTone(score: number): { tone: ImpactTone; toneLabel: string } {
  if (score >= 2) return { tone: "SUPPORTIVE", toneLabel: "අනුබල දෙන පැත්ත වැඩියි" };
  if (score <= -2) return { tone: "CHALLENGING", toneLabel: "අභියෝගාත්මක පැත්ත වැඩියි" };
  return { tone: "MIXED", toneLabel: "අවස්ථා සහ අභියෝග මිශ්‍රයි" };
}

/** Rank broad MD/AD topic windows first, then retain PD sub-windows that also
 * activate that topic. Scores show rule-based evidence convergence, not event
 * probability. Return fewer than ten when the evidence does not meet the rules.
 */
export function buildLifeTimeline(input: TimelineInput) {
  const birth = Date.parse(input.birthAt), now = Date.parse(input.asOf), until = now + 10 * YEAR;
  if (!Number.isFinite(birth) || !Number.isFinite(now) || now < birth) throw Error("INVALID_TIMELINE_CLOCK");
  if (!Number.isInteger(input.lagna) || input.lagna < 1 || input.lagna > 12) throw Error("INVALID_LAGNA");
  const positions = new Map(input.positions.map((p) => [p.graha_id, p.rasi_id]));
  if (positions.size !== 9 || Array.from({ length: 9 }, (_, i) => i + 1).some((id) => !positions.has(id)) ||
    input.positions.some((p) => !Number.isInteger(p.rasi_id) || p.rasi_id < 1 || p.rasi_id > 12)) {
    throw Error("INCOMPLETE_NATAL_DATA");
  }
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
  const parentCandidates: { md: DeepDashaPeriod; ad: DeepDashaPeriod; topic: Topic; score: number; side: "past" | "future" }[] = [];
  for (const ad of input.periods.filter((p) => p.level === 2)) {
    const md = byPath.get(ad.parent_path ?? "");
    if (!md) throw Error("INCOMPLETE_DASHA_CHAIN");
    const adStart = Date.parse(ad.start_at), adEnd = Date.parse(ad.end_at);
    if (adEnd <= adStart || adEnd <= birth || adStart >= until) continue;
    const side = adEnd <= now ? "past" : "future";
    for (const topic of TOPICS) {
      if ((adStart - birth) / YEAR < topic.age) continue;
      const mdLink = topicLink(houses, input.lagna, positions, md.graha_id, topic);
      const adLink = topicLink(houses, input.lagna, positions, ad.graha_id, topic);
      if (!mdLink.linked || !adLink.linked) continue;
      const detail = (x: typeof mdLink) => (x.direct ? 2 : 0) + Math.min(2, x.linkedRules.length);
      const score = 5 + detail(mdLink) + detail(adLink) + (md.graha_id !== ad.graha_id ? 1 : 0);
      parentCandidates.push({ md, ad, topic, score, side });
    }
  }

  function select(side: "past" | "future") {
    const parents = parentCandidates.filter((c) => c.side === side).sort((a, b) =>
      b.score - a.score || a.ad.start_at.localeCompare(b.ad.start_at) || a.topic.id.localeCompare(b.topic.id)
    );
    const shortlisted: typeof parents = [];
    const seenParents = new Set<string>();
    for (const candidate of parents) {
      if (seenParents.has(candidate.ad.path)) continue;
      seenParents.add(candidate.ad.path);
      shortlisted.push(candidate);
      if (shortlisted.length === 10) break;
    }
    const candidates: { item: TimelineItem; score: number; ad: string }[] = [];
    for (const parent of shortlisted) {
      const pds = (children.get(parent.ad.path) ?? []).filter((pd) => {
        const start = Date.parse(pd.start_at), end = Date.parse(pd.end_at);
        return end > start && start >= birth &&
          (side === "past" ? end <= now : start >= now && end <= until);
      });
      for (const pd of pds) {
        const pdLink = topicLink(houses, input.lagna, positions, pd.graha_id, parent.topic);
        if (!pdLink.linked) continue;
        const chain = [parent.md, parent.ad, pd];
        const lords = [...new Set(chain.map((p) => p.graha_id))];
        // Require a distinct lord at each of MD, AD and PD levels. Repeating
        // one planet at two levels does not count as independent convergence.
        if (lords.length !== 3) continue;
        const signals = chain.filter((p) => topicLink(houses, input.lagna, positions, p.graha_id, parent.topic).linked).length;
        const linkEvidence = lords.map((lord) => {
          const link = topicLink(houses, input.lagna, positions, lord, parent.topic);
          const linked = [
            link.direct ? "ජන්ම " + link.occupied + " භාවයේ පිහිටීම" : "",
            link.linkedRules.length ? link.linkedRules.join(" / ") + " භාව අධිපතිත්වය" : "",
          ].filter(Boolean).join(" සහ ");
          return GRAHA[lord] + ": " + (linked || "අදාළ භාව සම්බන්ධය");
        });
        const toneScore = lords.reduce((total, lord) => total + lordTone(houses, lord), 0);
        const { tone, toneLabel } = describeTone(toneScore);
        const evidenceScore = 3 + lords.length + chain.reduce((n, p) => {
          const link = topicLink(houses, input.lagna, positions, p.graha_id, parent.topic);
          return n + (link.direct ? 1 : 0) + link.linkedRules.length;
        }, 0);
        const evidenceStrength = evidenceScore >= 10 ? "STRONG" : "MODERATE";
        const impactLabel = evidenceStrength === "STRONG" ? "දශා සාක්ෂි එකතුව ප්‍රබලයි" : "දශා සාක්ෂි එකතුව මධ්‍යමයි";
        const directionEvidence = lords.map((lord) => {
          const functional = functionalTone(houses, lord);
          const natural = NATURAL_SUPPORTIVE.includes(lord) ? "ස්වභාවිකව අනුබල දෙන" :
            NATURAL_CHALLENGING.includes(lord) ? "ස්වභාවිකව අභියෝගාත්මක" : "ස්වභාවික ස්වභාවය මෙහි මධ්‍යස්ථ";
          const functionalText = functional > 0 ? "භාව අධිපතිත්වයෙන් අනුබල දෙන" :
            functional < 0 ? "භාව අධිපතිත්වයෙන් අභියෝගාත්මක" : "භාව අධිපතිත්වයෙන් මිශ්‍ර/මධ්‍යස්ථ";
          return GRAHA[lord] + ": " + natural + "; " + functionalText;
        });
        candidates.push({
          score: parent.score + 3 + (pdLink.direct ? 2 : 0) + Math.min(2, pdLink.linkedRules.length),
          ad: parent.ad.path,
          item: {
            id: pd.path + ":" + parent.topic.id,
            topic: parent.topic.id,
            label: parent.topic.label,
            text: parent.topic.text,
            startAt: pd.start_at,
            endAt: pd.end_at,
            dasha: chain,
            evidence: linkEvidence,
            directionEvidence,
            signals,
            evidenceStrength,
            tone,
            toneLabel,
            impactLabel,
            interpretation: parent.topic.text + " " + toneLabel + ". මෙය ජ්‍යොතිෂමය අනුමානයක් මිස තහවුරු වූ සිදුවීමක් නොවේ.",
          },
        });
      }
    }
    const selected: TimelineItem[] = [];
    const adCounts = new Map<string, number>();
    for (const candidate of candidates.sort((a, b) =>
      b.score - a.score || a.item.startAt.localeCompare(b.item.startAt) || a.item.topic.localeCompare(b.item.topic)
    )) {
      if ((adCounts.get(candidate.ad) ?? 0) >= 2) continue;
      selected.push(candidate.item);
      adCounts.set(candidate.ad, (adCounts.get(candidate.ad) ?? 0) + 1);
      if (selected.length === 10) break;
    }
    return selected.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }
  return {
    version: TIMELINE_VERSION,
    asOf: input.asOf,
    birthAt: input.birthAt,
    until: new Date(until).toISOString(),
    past: select("past"),
    future: select("future"),
  };
}
