import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="na-entry-screen">
      <Link href="/welcome" className="na-entry-frame na-splash" aria-label="NipunAstro වෙත පිවිසෙන්න">
        <img className="na-entry-art na-splash-art" src="https://upload.wikimedia.org/wikipedia/commons/7/70/Varma_-_Vishvamitra_Meditation.jpg" alt="" aria-hidden="true" />
        <div className="na-entry-shade" aria-hidden="true" />
        <div className="na-zodiac-arc" aria-hidden="true"><i/><i/><i/></div>
        <section className="na-splash-brand si-text">
          <div className="na-sacred-mini" aria-hidden="true">✦</div>
          <h1>NIPUN ASTRO</h1>
          <p>ජ්‍යෝතිෂය, ජීවිතයට දෘෂ්ටියක්</p>
          <span>Ancient Wisdom · Modern Clarity</span>
        </section>
      </Link>
    </main>
  );
}
