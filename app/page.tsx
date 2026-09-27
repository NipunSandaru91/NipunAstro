import Link from "next/link";
import { CosmicSageArt } from "@/app/components/reference-art";

export default function SplashPage(){
  return <main className="ref-screen">
    <Link href="/welcome" className="ref-phone ref-splash" aria-label="NipunAstro වෙත පිවිසෙන්න">
      <div className="ref-art-panel"><CosmicSageArt/></div>
      <section className="ref-splash-copy">
        <span className="ref-diamond">◇</span>
        <h1>NIPUN ASTRO</h1>
        <p className="ref-si-brand">ජීවිතයේ නක්ෂත්‍ර මඟ</p>
        <div className="ref-divider"/>
        <p className="ref-tagline">Ancient Wisdom <b>•</b> Modern Clarity</p>
        <span className="ref-diamond small">◇</span>
      </section>
    </Link>
  </main>;
}
