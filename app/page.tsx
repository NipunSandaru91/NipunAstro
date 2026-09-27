import Link from "next/link";
import { CosmicSageArt } from "@/app/components/reference-art";

export default function SplashPage() {
  return (
    <main className="ap-entry">
      <Link href="/welcome" className="ap-entry-frame ap-splash" aria-label="NipunAstro වෙත පිවිසෙන්න">
        <div className="ap-splash-visual" aria-hidden="true"><CosmicSageArt /></div>
        <div className="ap-entry-vignette" aria-hidden="true" />
        <section className="ap-splash-copy">
          <div className="ap-diamond-mark" aria-hidden="true"><span>✦</span></div>
          <h1>NIPUN ASTRO</h1>
          <p>ජීවිතයේ නක්ෂත්‍ර මග</p>
          <div className="ap-gold-rule" />
          <small>Ancient Wisdom <i>•</i> Modern Clarity</small>
        </section>
      </Link>
    </main>
  );
}
