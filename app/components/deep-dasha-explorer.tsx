import Link from 'next/link';
import type { buildDeepDashaView } from '@/lib/calculations/deep-dasha-view';
import ProfessionalChartTabs from '@/app/components/professional-chart-tabs';

const GRAHAS:Record<number,string>={1:'රවි',2:'චන්ද්‍ර',3:'කුජ',4:'බුධ',5:'ගුරු',6:'ශුක්‍ර',7:'ශනි',8:'රාහු',9:'කේතු'};
const LEVELS=['','මහාදශා','අන්තර්දශා','ප්‍රත්‍යන්තර්දශා','සූක්ෂ්ම දශා','ප්‍රාණ දශා'];
type Props={calculationId:string;title:string;timezone:string;now:number;view:ReturnType<typeof buildDeepDashaView>};

export default function DeepDashaExplorer({calculationId,title,timezone,now,view}:Props){
 const base=`/calculations/${calculationId}/dasha`;
 const href=(path:string)=>`${base}?period=${encodeURIComponent(path)}`;
 const format=(date:string)=>new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(date));
 return <main className="astro-shell min-h-screen px-4 py-6 pb-28 sm:px-6"><div className="mx-auto max-w-5xl">
  <Link className="text-sm text-[#176b4a] underline" href={`/calculations/${calculationId}`}>← කේන්දර වාර්තාව</Link>
  <header className="mt-6 border-b border-[#d7e5da] pb-6">
   <p className="eyebrow">Deep Dasha V2 · Beta</p><h1 className="serif mt-2 text-4xl text-[#18372a]">දශා කාල සටහන</h1>
   <p className="mt-3 text-sm text-[#566c5e]">{title} · වේලා කලාපය: {timezone}</p>
   <p className="mt-3 max-w-3xl text-sm leading-7 text-[#566c5e]">මහාදශාවේ සිට ප්‍රාණ දශාව දක්වා කාල සීමා බලන්න. එක් කාලයක් තෝරා එහි උපදශා විවෘත කරන්න.</p>
  </header>
  <ProfessionalChartTabs calculationId={calculationId} active="dasha" />
  <section className="astro-card mt-6 p-5" aria-label="වත්මන් දශා">
   <h2 className="text-lg font-semibold text-[#18372a]">දැනට ක්‍රියාත්මක දශා</h2>
   {view.current.length?<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{view.current.map(row=><Link key={row.path} href={href(row.path)} className="rounded-xl border border-[#b9d8c3] bg-[#f2f8f3] p-4 hover:bg-[#e8f4ec] focus-visible:outline-2 focus-visible:outline-[#176b4a]"><p className="text-xs text-[#566c5e]">{LEVELS[row.level]}</p><p className="mt-1 text-xl font-semibold text-[#176b4a]">{GRAHAS[row.graha_id]}</p><p className="mt-2 text-xs leading-5 text-[#566c5e]">අවසන්: {format(row.end_at)}</p></Link>)}</div>:<p className="mt-3 text-sm text-[#566c5e]">වත්මන් දිනය මෙම කාල සටහනට ඇතුළත් නොවේ.</p>}
   <p className="mt-3 text-xs text-[#566c5e]">පිටුව විවෘත කළ වේලාවට අදාළ තත්ත්වයයි. නවතම තත්ත්වය සඳහා පිටුව නැවත විවෘත කරන්න.</p>
  </section>
  <section className="astro-card mt-5 p-5 sm:p-7" aria-label="දශා ගවේෂණය">
   <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="දශා මාර්ගය"><Link href={base} className="text-[#176b4a] underline">සියලු මහාදශා</Link>{view.ancestors.map(row=><span key={row.path}> / <Link href={href(row.path)} aria-current={row.path===view.focus?.path?'page':undefined} className="text-[#176b4a] underline">{GRAHAS[row.graha_id]} · {LEVELS[row.level]}</Link></span>)}</nav>
   <h2 className="mt-5 text-2xl font-semibold text-[#18372a]">{view.focus?`${GRAHAS[view.focus.graha_id]} ${LEVELS[view.focus.level]}`:'මහාදශා'}</h2>
   {view.focus?<p className="mt-2 text-sm text-[#566c5e]">{format(view.focus.start_at)} → {format(view.focus.end_at)}</p>:null}
   <div className="mt-5 space-y-3">{view.children.map(row=>{
    const active=Date.parse(row.start_at)<=now&&now<Date.parse(row.end_at);
    const state=active?'දැනට ක්‍රියාත්මක':now<Date.parse(row.start_at)?'ඉදිරියේ':'අවසන්';
    return <Link key={row.path} href={href(row.path)} className={`block rounded-xl border p-4 transition hover:border-[#176b4a] ${active?'border-[#b9d8c3] bg-[#f2f8f3]':'border-[#d7e5da] bg-white'}`}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-[#18372a]">{GRAHAS[row.graha_id]} · {LEVELS[row.level]}</h3><span className="rounded-full border border-[#d7e5da] px-2 py-1 text-xs text-[#176b4a]">{state}</span></div><p className="mt-2 text-sm leading-6 text-[#566c5e]">{format(row.start_at)} → {format(row.end_at)}</p><p className="mt-2 text-xs text-[#176b4a]">{row.level<5?'උපදශා බලන්න →':'කාල සීමාව බලන්න →'}</p></Link>;
   })}</div>
   {view.focus?.level===5?<p className="mt-4 text-sm text-[#566c5e]">ප්‍රාණ දශාව මෙම සටහනේ අවසාන මට්ටමයි.</p>:null}
  </section>
  <p className="mt-5 text-xs leading-6 text-[#566c5e]">V2 පරීක්ෂණ නිකුතුව · ග්‍රහ හඳුනාගැනීමේ නිවැරදි කිරීම් නිසා පෙර සටහන්වලට වඩා දශා අධිපති නම් හෝ කාල සීමා වෙනස් විය හැක. මෙහි පෙන්වන්නේ දශා කාල සීමායි; සිදුවීම් පිළිබඳ අර්ථකථන වෙනම පෙන්වයි.</p>
 </div></main>;
}
