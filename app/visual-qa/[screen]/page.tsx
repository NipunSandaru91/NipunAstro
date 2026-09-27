import Link from "next/link";
import { notFound } from "next/navigation";

const screens = {
  dashboard: { title: "මුල් පිටුව", eyebrow: "Dashboard", body: "ජන්ම හදහන, දශා, ගෝචර සහ පුරෝකථන වෙත එකම cosmic observatory shell එකෙන් පිවිසෙන්න." },
  "new-chart": { title: "නව හදහන", eyebrow: "Birth details", body: "නම, උපන් දිනය, වේලාව සහ ස්ථානය clean step flow එකකින් ඇතුළත් කරන screen එක." },
  "my-charts": { title: "මගේ හදහන්", eyebrow: "Chart library", body: "සුරකින ලද හදහන් clean cards ලෙස, පුද්ගල නම සහ උපන් තොරතුරු සමඟ." },
  calculation: { title: "හදහන් විශ්ලේෂණය", eyebrow: "Calculation", body: "D1 සහ ග්‍රහ පිහිටීම් එකම verified calculation report එකක." },
  dasha: { title: "විංශෝත්තරී දශා", eyebrow: "Daśā timeline", body: "මහාදශා සහ අන්තර්දශා gold timeline system එකක." },
  transit: { title: "ගෝචර විශ්ලේෂණය", eyebrow: "Transit analysis", body: "වත්මන් ග්‍රහ ගමන්, රාශි, භාව සහ natal interaction." },
  predictions: { title: "පුරෝකථන", eyebrow: "Prediction layer", body: "භාව 12, supporting evidence, contradicting evidence, දශා සහ ගෝචර timing." },
  profile: { title: "පැතිකඩ", eyebrow: "Account", body: "භාෂාව, timezone සහ account settings එකම visual system එකෙන්." },
  admin: { title: "පරිපාලන පුවරුව", eyebrow: "Admin", body: "Users, charts, engine status සහ standards clean operational surface එකක." },
} as const;

type ScreenKey = keyof typeof screens;

export default async function VisualQaScreen({ params }: { params: Promise<{ screen: string }> }) {
  if (process.env.VISUAL_QA_MODE !== "1") notFound();
  const { screen } = await params;
  if (!(screen in screens)) notFound();
  const key = screen as ScreenKey;
  const item = screens[key];

  return <main className="na-vqa-shell si-text">
    <header className="na-app-header">
      <div className="na-app-header-inner">
        <span className="na-menu-mark">☰</span>
        <span className="na-wordmark">NIPUN ASTRO</span>
        <span className="na-avatar">N</span>
      </div>
    </header>

    <section className="na-vqa-main">
      <div className="na-vqa-hero">
        <p>{item.eyebrow}</p>
        <h1>{item.title}</h1>
        <span>{item.body}</span>
        <div className="na-vqa-orbit" aria-hidden="true"><i/><b>✦</b></div>
      </div>

      <div className="na-vqa-grid">
        <article className="na-vqa-card featured">
          <small>සාරාංශය</small>
          <h2>{key === "new-chart" ? "Nipun Sandaru" : key === "transit" ? "වත්මන් ගෝචර තත්ත්වය" : "ජ්‍යෝතිෂ දත්ත සාරාංශය"}</h2>
          <p>Dark navy surfaces, restrained gold accents, fine celestial geometry සහ live Sinhala typography.</p>
        </article>
        <article className="na-vqa-card"><small>ග්‍රහ</small><strong>☉  ☽  ♃  ♄</strong><p>Verified placement data</p></article>
        <article className="na-vqa-card"><small>රාශි</small><strong>♈ ♋ ♑ ♓</strong><p>Sidereal · Lahiri</p></article>
        <article className="na-vqa-card"><small>භාව</small><strong>01 · 04 · 07 · 10</strong><p>Whole-sign structure</p></article>
      </div>

      <section className="na-vqa-panel">
        <div><small>Evidence chain</small><h2>ග්‍රහ → රාශි → භාව → නීතිය → Timing</h2></div>
        <div className="na-vqa-pills"><span>SUPPORTING</span><span>MODERATE</span><span>TRACEABLE</span></div>
      </section>

      <section className="na-vqa-list">
        <div><span>01</span><b>දත්ත</b><small>Verified calculation foundation</small></div>
        <div><span>02</span><b>විශ්ලේෂණය</b><small>Rule + evidence</small></div>
        <div><span>03</span><b>කාලය</b><small>Daśā + Transit</small></div>
      </section>
    </section>

    <nav className="na-bottom-nav">
      <Link href="/visual-qa/dashboard" className={key==="dashboard"?"active":""}><span>⌂</span><small>මුල් පිටුව</small></Link>
      <Link href="/visual-qa/my-charts" className={key==="my-charts"?"active":""}><span>◉</span><small>මගේ හදහන්</small></Link>
      <Link href="/visual-qa/predictions" className={key==="predictions"?"active":""}><span>✦</span><small>පුරෝකථන</small></Link>
      <Link href="/visual-qa/profile" className={key==="profile"?"active":""}><span>◎</span><small>පැතිකඩ</small></Link>
    </nav>
  </main>;
}
