import Link from "next/link";
import { CosmicHorizonArt } from "@/app/components/reference-art";

export default function WelcomePage() {
  return (
    <main className="ap-entry">
      <div className="ap-entry-frame ap-welcome">
        <div className="ap-welcome-visual" aria-hidden="true"><CosmicHorizonArt /></div>
        <div className="ap-entry-vignette" aria-hidden="true" />
        <section className="ap-welcome-copy">
          <p className="ap-kicker">VEDIC JYOTIṢA · COSMIC OBSERVATORY</p>
          <h1>වේද නක්ෂත්‍ර විද්‍යාවේ ප්‍රඥාව<br/><span>ඔබේ ජීවිතයට</span></h1>
          <p>ජන්ම හදහන, දශා, ගෝචර සහ පුරෝකථන එකම පැහැදිලි අත්දැකීමකින්.</p>
        </section>
        <footer className="ap-welcome-footer">
          <div className="ap-slide-dots" aria-hidden="true"><i className="active"/><i/><i/></div>
          <Link href="/login" className="ap-primary-button">ආරම්භ කරන්න <span>→</span></Link>
        </footer>
      </div>
    </main>
  );
}
