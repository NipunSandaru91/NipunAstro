import AppNav from "@/app/components/app-nav";
const cards=[
 {title:"විදේශ / දුරස්ථ වෘත්තීය සම්බන්ධතා",level:"STRONG",body:"ජන්ම සාධක කිහිපයක් එකිනෙක සහාය දක්වන වෘත්තීය තේමාවකි.",tag:"Career / Business"},
 {title:"සන්නිවේදන හා තාක්ෂණික ක්ෂේත්‍ර",level:"MODERATE",body:"බුධ හා කුජ සම්බන්ධ සාධක වෘත්තීය ක්‍රියාකාරකම් සමඟ සම්බන්ධ වේ.",tag:"Skill Pattern"},
 {title:"ස්වාධීන ආදායම් / ව්‍යාපාර",level:"MODERATE",body:"ආදායම් හා ලාභ භාව සම්බන්ධතා තවත් timing support සමඟ විමසිය යුතුය.",tag:"Business"},
];
export default function PredictionsPage(){
 return <><AppNav active="predictions"/><main className="astro-shell min-h-screen px-4 py-6 sm:px-6">
  <div className="mx-auto max-w-6xl">
   <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-9">
    <p className="eyebrow">Prediction Observatory</p>
    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
     <div><h1 className="serif text-4xl text-[#f3dfb1] sm:text-5xl">පුරෝකථන</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b4a9]">ජන්ම සාධක, දශා සහ ගෝචර සක්‍රීයතාව එකම evidence chain එකකින් විමසන පුරෝකථන මධ්‍යස්ථානය.</p></div>
     <div className="cosmic-orbit-card" aria-hidden="true"><span>☉</span><i/><b>♃</b></div>
    </div>
   </section>
   <nav className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Prediction topics">{["රැකියා / ව්‍යාපාර","ධනය","සම්බන්ධතා","අධ්‍යාපනය","ආධ්‍යාත්මික"].map((x,i)=><button key={x} className={i===0?"astro-chip active":"astro-chip"}>{x}</button>)}</nav>
   <section className="mt-4 grid gap-4 lg:grid-cols-3">{cards.map((c,i)=><article className="astro-card" key={c.title}><div className="flex items-center justify-between gap-3"><span className="text-xs text-[#c9a95e]">{c.tag}</span><span className="strength-pill">{c.level}</span></div><h2 className="serif mt-5 text-2xl text-[#f0e4c8]">{c.title}</h2><p className="mt-3 text-sm leading-7 text-[#9fa5ad]">{c.body}</p><details className="why-card mt-6"><summary>මෙම ප්‍රතිඵලයට හේතුව</summary><div className="reason-flow mt-4"><span>ග්‍රහ</span><b>→</b><span>රාශි</span><b>→</b><span>භාව</span><b>→</b><span>නීතිය</span></div><div className="mt-4 grid gap-2 text-xs text-[#aeb3ba]"><p>＋ සහායක සාධක: Dṛṣṭi · Ṣaḍbala · Yoga</p><p>− විරුද්ධ සාධක: placement conditions</p></div></details>{i===0?<div className="timing-strip mt-4"><span>දශා</span><b>＋</b><span>අන්තර්දශා</span><b>＋</b><span>ගෝචර</span><strong>ACTIVE NOW</strong></div>:null}</article>)}</section>
   <p className="mt-6 text-center text-[11px] leading-5 text-[#686d74]">මෙහි strength යනු rule-system evidence balance එකයි. සැබෑ ජීවිතයේ probability ප්‍රතිශතයක් නොවේ.</p>
  </div></main></>;
}