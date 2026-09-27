import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="reference-auth-screen splash-reference">
      <Link href="/welcome" className="reference-auth-frame" aria-label="Continue to NipunAstro">
        <div className="sage-scene" aria-hidden="true">
          <div className="zodiac-ring ring-a" />
          <div className="zodiac-ring ring-b" />
          <div className="chakra-line">
            {["#d8b14c","#e47b3a","#e9b14c","#4e9ec2","#55a5c4","#a36cb2","#d8b14c"].map((c,i)=><i key={i} style={{background:c}} />)}
          </div>
          <div className="sage-silhouette"><span>ॐ</span></div>
          <div className="temple-silhouette" />
        </div>
        <section className="splash-copy">
          <div className="ornament">◇</div>
          <h1>NIPUN ASTRO</h1>
          <p className="si-title">ජීවිතයේ තත්ත්ව මඟ</p>
          <div className="gold-rule" />
          <p className="tagline">Ancient Wisdom <span>•</span> Modern Clarity</p>
          <div className="ornament small">◇</div>
        </section>
      </Link>
    </main>
  );
}
