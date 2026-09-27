import Link from "next/link";

const COSMOLOGY_ART="https://upload.wikimedia.org/wikipedia/commons/b/bf/Earth_in_a_cosmology.jpg";

export default function WelcomePage(){
  return <main className="ref-screen">
    <div className="ref-phone real-art-welcome">
      <img className="real-art-welcome-image" src={COSMOLOGY_ART} alt="" aria-hidden="true"/>
      <div className="real-art-welcome-wash" aria-hidden="true"/>
      <div className="welcome-orbit-glow" aria-hidden="true"><i/><i/><i/></div>

      <section className="real-art-welcome-copy">
        <p className="welcome-kicker">VEDIC COSMOLOGY · JYOTIṢA</p>
        <h1>වේද නක්ෂත්‍ර විද්‍යාවේ<br/>පුරාණ දැනුම<br/><span>ඔබේ ජීවිතයට</span></h1>
        <p>ජන්ම ගණනය, දශා, ගෝචර සහ evidence-driven පුරෝකථන එකම පැහැදිලි නිරීක්ෂණයකින්.</p>
      </section>

      <div className="real-art-welcome-footer">
        <div className="ref-pager"><i className="active"/><i/><i/><i/></div>
        <Link href="/login" className="ref-pill-button">ආරම්භ කරන්න <span>→</span></Link>
        <small className="art-credit">Cosmology manuscript, 1468 · Public domain</small>
      </div>
    </div>
  </main>;
}
