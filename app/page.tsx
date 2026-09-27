import Link from "next/link";

const SAGE_ART="https://upload.wikimedia.org/wikipedia/commons/7/70/Varma_-_Vishvamitra_Meditation.jpg";

export default function SplashPage(){
  return <main className="ref-screen">
    <Link href="/welcome" className="ref-phone real-art-splash" aria-label="NipunAstro වෙත පිවිසෙන්න">
      <img className="real-art-splash-image" src={SAGE_ART} alt="" aria-hidden="true"/>
      <div className="real-art-cosmic-wash" aria-hidden="true"/>
      <div className="real-art-zodiac" aria-hidden="true">
        <i className="rz-ring r1"/><i className="rz-ring r2"/><i className="rz-ring r3"/>
        <div className="rz-signs">♈ · ♉ · ♊ · ♋ · ♌ · ♍ · ♎ · ♏ · ♐ · ♑ · ♒ · ♓</div>
        <div className="rz-axis">
          <b/><b/><b/><b/><b/><b/><b/>
        </div>
      </div>
      <section className="real-art-brand">
        <span className="ref-diamond">◇</span>
        <h1>NIPUN ASTRO</h1>
        <p className="ref-si-brand">ජීවිතයේ නක්ෂත්‍ර මඟ</p>
        <div className="ref-divider"/>
        <p className="ref-tagline">Ancient Wisdom <b>•</b> Modern Clarity</p>
        <span className="ref-diamond small">◇</span>
      </section>
      <small className="art-credit">Artwork: Raja Ravi Varma, 1897 · Public domain</small>
    </Link>
  </main>;
}
