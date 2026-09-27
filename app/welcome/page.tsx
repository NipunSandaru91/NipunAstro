import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="na-entry-screen">
      <div className="na-entry-frame na-welcome">
        <img className="na-entry-art na-welcome-art" src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Earth_in_a_cosmology.jpg" alt="" aria-hidden="true" />
        <div className="na-entry-shade" aria-hidden="true" />
        <div className="na-welcome-orbit" aria-hidden="true" />
        <section className="na-welcome-copy si-text">
          <p className="na-kicker">VEDIC JYOTIṢA · COSMIC OBSERVATORY</p>
          <h1>ඔබගේ ජීවිත ගමනට<br/><span>ජ්‍යෝතිෂය සමඟ දෘෂ්ටියක්</span></h1>
          <p>ජන්ම හදහන, දශා, ගෝචර සහ evidence-backed පුරෝකථන එකම පැහැදිලි අත්දැකීමකින්.</p>
        </section>
        <footer className="na-entry-footer">
          <div className="na-dots" aria-hidden="true"><i className="active"/><i/><i/></div>
          <Link href="/login" className="na-gold-button">ආරම්භ කරන්න <span>→</span></Link>
        </footer>
      </div>
    </main>
  );
}
