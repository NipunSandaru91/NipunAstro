"use client";

import { useState, type ReactNode } from "react";
import type { PersonalTopicReading } from "@/lib/prediction/ui/personal-topic-reading";

export type PersonalTopic = {
  id: string;
  label: string;
  natalLevel: "WEAK" | "MODERATE" | "STRONG";
  reading: PersonalTopicReading;
  current: PeriodPrediction | null;
  next: PeriodPrediction | null;
};

export type PeriodPrediction = {
  maha: string;
  antar: string;
  start: string;
  end: string;
  activation: "NONE" | "MODERATE" | "STRONG";
  narrative: string;
};

function formatRange(start: string, end: string, timezone: string) {
  const fmt = (value: string) => new Intl.DateTimeFormat("si-LK", { year: "numeric", month: "short", day: "numeric", timeZone: timezone }).format(new Date(value));
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function PersonalPredictionTabs({ topics, timezone, nature }: { topics: PersonalTopic[]; timezone: string; nature?: ReactNode }) {
  const [topicId, setTopicId] = useState(nature ? "nature" : topics[0]?.id ?? "CAREER");
  const [mode, setMode] = useState<"natal" | "timing">("natal");
  const topic = topicId === "nature" ? undefined : topics.find((item) => item.id === topicId) ?? topics[0];
  return <>
    <section className="mt-7 rounded-3xl border border-[#d7e5da] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-semibold text-[#175c43]">කේන්දර කියවීම</h2>
      <div role="group" aria-label="පුරෝකථන මාතෘකා" className="na-topic-tabs">
        {nature ? <button type="button" aria-pressed={topicId === "nature"} onClick={() => setTopicId("nature")}>චරිතය</button> : null}
        {topics.map((item) => <button key={item.id} type="button" aria-pressed={topic?.id === item.id} onClick={() => setTopicId(item.id)} className={`rounded-2xl border px-4 py-4 text-sm transition ${topic?.id === item.id ? "border-[#b9d8c3] bg-[#eef7f0] font-semibold text-[#176b4a]" : "border-[#d7e5da] bg-white text-[#566c5e] hover:bg-[#f6faf7]"}`}>{item.label}</button>)}
      </div>
    </section>
    {topicId === "nature" ? nature : null}
    {topic ? <section className="mt-5 rounded-3xl border border-[#d7e5da] bg-white p-5 shadow-sm sm:p-7">
      <div role="group" aria-label="කියවීමේ කාලය" className="inline-flex rounded-xl border border-[#d7e5da] p-1">
        <button type="button" aria-pressed={mode === "natal"} onClick={() => setMode("natal")} className={`rounded-lg px-4 py-2 text-sm ${mode === "natal" ? "bg-[#176b4a] text-white" : "text-[#566c5e]"}`}>D1</button>
        <button type="button" aria-pressed={mode === "timing"} onClick={() => setMode("timing")} className={`rounded-lg px-4 py-2 text-sm ${mode === "timing" ? "bg-[#176b4a] text-white" : "text-[#566c5e]"}`}>දශා/අනුදශා</button>
      </div>
      {mode === "natal" ? <div className="mt-6 space-y-4">
        <article className="rounded-2xl bg-[#f6faf7] p-5 sm:p-6"><p className="eyebrow">{topic.label} · D1 ප්‍රතිඵලය · {topic.natalLevel}</p><h3 className="serif mt-2 text-2xl text-[#18372a]">ඔබේ උපන් කේන්දරයෙන්</h3><p className="mt-3 text-sm leading-8 text-[#40584a]">{topic.reading.outcome}</p></article>
        <article className="rounded-2xl border border-[#d7e5da] bg-white p-5 sm:p-6"><p className="eyebrow">කේන්දරයේ නිශ්චිත සලකුණු</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{topic.reading.anchors.map((anchor, index) => <div key={`${anchor.sourceBhava}-${anchor.grahaId}-${index}`} className="rounded-xl bg-[#f6faf7] p-4"><p className="text-xs font-semibold text-[#176b4a]">{anchor.sourceBhava} වන භාවය · {anchor.sourceLabel}</p><p className="mt-2 text-sm leading-7 text-[#40584a]">{anchor.ruleText}. මෙම පිහිටීමෙන් {anchor.sourceLabel} සම්බන්ධ ප්‍රතිඵල {anchor.resultChannel} හරහා මතු වීමට ඉඩ ඇත; {anchor.rasiLabel} රාශියේ ගුණය එම ප්‍රකාශයට හැඩයක් ලබා දෙයි.</p>{anchor.supporting.length ? <p className="mt-2 text-xs leading-6 text-[#176b4a]">සහාය: {anchor.supporting.join(" · ")}</p> : null}{anchor.contradicting.length ? <p className="mt-2 text-xs leading-6 text-[#8b5c38]">අවධානය: {anchor.contradicting.join(" · ")}</p> : null}</div>)}</div></article>
        {topic.reading.strengths.length || topic.reading.cautions.length ? <article className="grid gap-3 sm:grid-cols-2">{topic.reading.strengths.length ? <div className="rounded-2xl border border-[#d7e5da] bg-white p-5"><p className="eyebrow">සහාය දෙන සාධක</p><ul className="mt-3 space-y-2 text-sm leading-7 text-[#40584a]">{topic.reading.strengths.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}{topic.reading.cautions.length ? <div className="rounded-2xl border border-[#eadfcf] bg-white p-5"><p className="eyebrow">සමබරව සලකා බලන්න</p><ul className="mt-3 space-y-2 text-sm leading-7 text-[#6f5740]">{topic.reading.cautions.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}</article> : null}
      </div> : <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[{ label: "දැනට ක්‍රියාත්මක දශා / අනු දශා", value: topic.current }, { label: "ඊළඟ දශා / අනු දශා", value: topic.next }].map((entry) => <article key={entry.label} className="rounded-2xl bg-[#f6faf7] p-5 sm:p-6"><p className="eyebrow">{entry.label}</p>{entry.value ? <><h3 className="serif mt-2 text-xl text-[#18372a]">{entry.value.maha} / {entry.value.antar}</h3><p className="mt-1 text-xs text-[#6a7c70]">{formatRange(entry.value.start, entry.value.end, timezone)}</p><p className="mt-4 text-sm leading-8 text-[#40584a]">{entry.value.narrative}</p></> : <p className="mt-3 text-sm leading-7 text-[#566c5e]">මෙම කේන්දරයට අවශ්‍ය දශා කාල සීමා තවම සකස් වී නැත.</p>}</article>)}
      </div>}
      <p className="mt-5 text-[11px] leading-6 text-[#6a7c70]">මෙය සාම්ප්‍රදායික ජ්‍යෝතිෂ්‍ය අර්ථකථනයක් පමණි; නියත අනාගත ප්‍රකාශයක් හෝ වෘත්තීය උපදෙසක් නොවේ.</p>
    </section> : null}
  </>;
}
