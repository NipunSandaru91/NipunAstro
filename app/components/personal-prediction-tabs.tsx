"use client";

import { useState } from "react";

export type PersonalTopic = {
  id: string;
  label: string;
  natalLevel: "WEAK" | "MODERATE" | "STRONG";
  current: PeriodPrediction | null;
  next: PeriodPrediction | null;
};

export type PeriodPrediction = {
  maha: string;
  antar: string;
  start: string;
  end: string;
  activation: "NONE" | "MODERATE" | "STRONG";
};

const RESULT_COPY: Record<string, Record<PersonalTopic["natalLevel"], string>> = {
  CAREER: {
    WEAK: "වෘත්තීය මඟේ ඉදිරියට යාමට ඔබේම උත්සාහය සහ ඉවසීම වැදගත් වන කාලයක්. කුඩා පියවරක් වුවත්, එය අනාගතයේ විශාල වෙනසකට දොර විවර කළ හැකියි.",
    MODERATE: "වෘත්තීය ජීවිතයේ නව වගකීමක් හෝ අවස්ථාවක් ඔබ ඉදිරියේ මතු විය හැකියි. සූදානමින් සිටියහොත් එය ඔබේ නම ඉදිරියට ගෙන යන හැරවුමක් වේවි.",
    STRONG: "වෘත්තීය ජීවිතයේ කැපී පෙනෙන ඉදිරි පියවරකට ඉඩකඩ පෙනේ. ඔබ කළ වැඩක් දැන් ප්‍රතිඵල දෙන මොහොතක් විය හැකියි; අවස්ථාව පැමිණි විට පසුබට නොවන්න.",
  },
  EDUCATION: {
    WEAK: "ඉගෙනීමේ ජයග්‍රහණය වේගයට වඩා අඛණ්ඩ උත්සාහයෙන් ලැබෙන රටාවක් පෙනේ. අද තබන කුඩා පියවර හෙට විශ්වාසයෙන් ඉදිරියට යාමට පදනම වේවි.",
    MODERATE: "නව දැනුමක් හෝ පුහුණුවක් ඔබට වැදගත් දොරක් විවෘත කළ හැකියි. අවධානය එක තැනකට යොමු කළ විට ඔබේ හැකියාව බලාපොරොත්තු වූවාට වඩා දුර යාවි.",
    STRONG: "දැනුමෙන් ඉදිරියට පැනීමට හොඳ හැකියාවක් පෙනේ. විභාගයක්, පාඨමාලාවක් හෝ අලුත් විෂයක් ඔබේ ගමනේ හැරවුම් ලක්ෂ්‍යයක් විය හැකියි.",
  },
  RELATIONSHIP: {
    WEAK: "සම්බන්ධතා වඩාත් ශක්තිමත් වන්නේ අවංක කතාබහෙන් සහ කාලය දීමෙන්. නොකී හැඟීමක් නිහඬව තබා නොගෙන, සන්සුන්ව බෙදාගැනීමෙන් සමීපත්වය වැඩි කළ හැකියි.",
    MODERATE: "වැදගත් සම්බන්ධතාවයක නව අවබෝධයක් හෝ සමීපත්වයක් ගොඩනැගිය හැකි කාලයක්. කුඩා අවධානයක් විශාල වෙනසක් ඇති කරාවි.",
    STRONG: "හදවතට සමීප බැඳීමක් තවත් ගැඹුරු වීමට හෝ අලුත් වැදගත් බැඳීමක් ඇරඹීමට ඉඩක් පෙනේ. ඔබේ අවංක තීරණය සම්බන්ධතාවයක අලුත් පරිච්ඡේදයක් අරඹන්න පුළුවන්.",
  },
  FINANCE: {
    WEAK: "මුදල් කටයුතු සැලසුම් කර පියවරෙන් පියවර ගොඩනැගීම වාසිදායකයි. හදිසි තීරණයකට පෙර නැවත බැලීමෙන් අනවශ්‍ය බරක් අඩු කරගත හැකියි.",
    MODERATE: "ආදායමක් හෝ සම්පත් කළමනාකරණය පිළිබඳ හොඳ අවස්ථාවක් මතු විය හැකියි. සැලසුමක් සමඟ ක්‍රියා කළහොත් එය ස්ථාවරත්වයට මඟ පාදාවි.",
    STRONG: "මුදල් සහ සම්පත් වර්ධනයට සැලකිය යුතු අවස්ථාවක් පෙනේ. හොඳ තීරණයකින් දිගුකාලීන ප්‍රතිඵලයක් ලැබිය හැකි නිසා, අවස්ථාවත් අවදානමත් දෙකම බලා ක්‍රියා කරන්න.",
  },
  HEALTH: {
    WEAK: "ඔබේ දෛනික රිද්මය සහ විවේකය ගැන සැලකිලිමත් වීම මේ කාලයේ වටිනායි. සුවතාව ගැන කනස්සල්ලක් තිබේ නම් සුදුසු සෞඛ්‍ය වෘත්තිකයෙකුගෙන් උපදෙස් ගන්න.",
    MODERATE: "සමබර දිනචරියාවක් ඔබට වැඩි ශක්තියක් සහ සැහැල්ලුවක් ලබා දිය හැකියි. ශරීරයේ අවශ්‍යතා අසා, අවශ්‍ය විට වෘත්තීය උපදෙස් ලබාගන්න.",
    STRONG: "සුවතාව වැඩිදියුණු කරගැනීමට සහ පුරුදු නැවත සකස් කිරීමට හොඳ අවධානයක් පෙනේ. විවේකය හා සීමාවන්ට ගරු කිරීමෙන් ඔබේ ශක්තිය නැවත ගොඩනඟාගත හැකියි.",
  },
  SPIRITUALITY: {
    WEAK: "නිහඬව සිතීමට සහ ඔබට අර්ථවත් දේ හඳුනාගැනීමට කාලය වෙන් කරන්න. සෙමින් සිදුවන අභ්‍යන්තර වෙනසක් ඔබට නව පැහැදිලි බවක් ගෙනේවි.",
    MODERATE: "අධ්‍යයනය, භාවනාව හෝ ඔබ විශ්වාස කරන පුරුද්දක් තුළින් අභ්‍යන්තර පැහැදිලි බවක් ලැබිය හැකියි. අලුත් අදහසක් ජීවිතය දෙස බලන ආකාරය වෙනස් කරාවි.",
    STRONG: "අභ්‍යන්තර පරිවර්තනයකට සහ අලුත් අර්ථයක් සොයා යාමට බලවත් අවධියක් පෙනේ. දිගු කලක් සොයමින් සිටි පිළිතුරක් නිහඬ මොහොතකදී පැහැදිලි විය හැකියි.",
  },
};

function timeCopy(period: PeriodPrediction) {
  if (period.activation === "STRONG") return "මෙම කාලයේදී මේ ජීවිත ක්ෂේත්‍රය කැපී පෙනෙන ලෙස ඉදිරියට පැමිණිය හැකියි. වැදගත් තීරණයක් හෝ දිගු කලක් බලා සිටි ප්‍රතිඵලයක් මතු විය හැකි නිසා, අවස්ථාව හඳුනාගෙන සූදානමින් සිටින්න.";
  if (period.activation === "MODERATE") return "මෙම කාලය තුළ මේ ක්ෂේත්‍රයට අදාළ කතාබහක්, අවස්ථාවක් හෝ වෙනසක් මතු විය හැකියි. ඔබ ගන්නා ප්‍රායෝගික පියවර එහි ප්‍රතිඵලය හැඩගස්වාවි.";
  return "මෙම කාලයේදී මේ ක්ෂේත්‍රය පසුබිමේ සෙමින් ක්‍රියාත්මක විය හැකියි. ඉක්මන් තීරණයකට වඩා සූදානම් වීම සහ පැමිණෙන සංඥා නිරීක්ෂණය කිරීම ප්‍රයෝජනවත් වේවි.";
}

function formatRange(start: string, end: string, timezone: string) {
  const fmt = (value: string) => new Intl.DateTimeFormat("si-LK", { year: "numeric", month: "short", day: "numeric", timeZone: timezone }).format(new Date(value));
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function PersonalPredictionTabs({ topics, timezone }: { topics: PersonalTopic[]; timezone: string }) {
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "CAREER");
  const [mode, setMode] = useState<"natal" | "timing">("natal");
  const topic = topics.find((item) => item.id === topicId) ?? topics[0];
  return <>
    <section className="mt-7 rounded-3xl border border-[#d7e5da] bg-white p-5 shadow-sm sm:p-7">
      <p className="eyebrow">Prediction Topic</p><h2 className="serif mt-2 text-3xl text-[#176b4a]">විශ්ලේෂණ අංගය තෝරන්න</h2>
      <div role="tablist" aria-label="පුරෝකථන මාතෘකා" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {topics.map((item) => <button key={item.id} type="button" role="tab" aria-selected={topic?.id === item.id} onClick={() => setTopicId(item.id)} className={`rounded-2xl border px-4 py-4 text-sm transition ${topic?.id === item.id ? "border-[#b9d8c3] bg-[#eef7f0] font-semibold text-[#176b4a]" : "border-[#d7e5da] bg-white text-[#566c5e] hover:bg-[#f6faf7]"}`}>{item.label}</button>)}
      </div>
    </section>
    {topic ? <section className="mt-5 rounded-3xl border border-[#d7e5da] bg-white p-5 shadow-sm sm:p-7">
      <div role="tablist" aria-label="කියවීමේ කාලය" className="inline-flex rounded-xl border border-[#d7e5da] p-1">
        <button type="button" role="tab" aria-selected={mode === "natal"} onClick={() => setMode("natal")} className={`rounded-lg px-4 py-2 text-sm ${mode === "natal" ? "bg-[#176b4a] text-white" : "text-[#566c5e]"}`}>උපන් වෙලාවට</button>
        <button type="button" role="tab" aria-selected={mode === "timing"} onClick={() => setMode("timing")} className={`rounded-lg px-4 py-2 text-sm ${mode === "timing" ? "bg-[#176b4a] text-white" : "text-[#566c5e]"}`}>තත්කාලීන</button>
      </div>
      {mode === "natal" ? <article className="mt-6 rounded-2xl bg-[#f6faf7] p-5 sm:p-6"><p className="eyebrow">{topic.label} · D1</p><h3 className="serif mt-2 text-2xl text-[#18372a]">ඔබේ උපන් කේන්දරයෙන්</h3><p className="mt-3 text-sm leading-8 text-[#40584a]">{RESULT_COPY[topic.id]?.[topic.natalLevel] ?? RESULT_COPY.CAREER.MODERATE}</p></article> : <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[{ label: "දැනට ක්‍රියාත්මක දශා / අනු දශා", value: topic.current }, { label: "ඊළඟ දශා / අනු දශා", value: topic.next }].map((entry) => <article key={entry.label} className="rounded-2xl bg-[#f6faf7] p-5 sm:p-6"><p className="eyebrow">{entry.label}</p>{entry.value ? <><h3 className="serif mt-2 text-xl text-[#18372a]">{entry.value.maha} / {entry.value.antar}</h3><p className="mt-1 text-xs text-[#6a7c70]">{formatRange(entry.value.start, entry.value.end, timezone)}</p><p className="mt-4 text-sm leading-8 text-[#40584a]">{timeCopy(entry.value)}</p></> : <p className="mt-3 text-sm leading-7 text-[#566c5e]">මෙම කේන්දරයට අවශ්‍ය දශා කාල සීමා තවම සකස් වී නැත.</p>}</article>)}
      </div>}
      <p className="mt-5 text-[11px] leading-6 text-[#6a7c70]">මෙය සාම්ප්‍රදායික ජ්‍යෝතිෂ්‍ය අර්ථකථනයක් පමණි; නියත අනාගත ප්‍රකාශයක් හෝ වෘත්තීය උපදෙසක් නොවේ.</p>
    </section> : null}
  </>;
}
