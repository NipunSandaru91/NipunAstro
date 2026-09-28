import Link from "next/link";

const MILKY_WAY_ART="https://assets.science.nasa.gov/dynamicimage/assets/science/missions/hubble/releases/2009/01/STScI-01EVT5WGYG6MTE5FFYSWR91K54.tif?w=2000";

export default function WelcomePage(){
  return <main className="ref-screen">
    <div className="ref-phone real-art-welcome">
      <img className="real-art-welcome-image" src={MILKY_WAY_ART} alt="" aria-hidden="true"/>
      <div className="real-art-welcome-wash" aria-hidden="true"/>

      <section className="real-art-welcome-copy">
        <p className="welcome-kicker">VEDIC COSMOLOGY · JYOTIṢA</p>
        <h1>වේද නක්ෂත්‍ර විද්‍යාවේ<br/>පුරාණ දැනුම<br/><span>ඔබේ ජීවිතයට</span></h1>
        <p>ජන්ම ගණනය, දශා, ගෝචර සහ evidence-driven පුරෝකථන එකම පැහැදිලි නිරීක්ෂණයකින්.</p>
      </section>

      <div className="real-art-welcome-footer">
        <Link href="/login" className="ref-pill-button">ආරම්භ කරන්න <span>→</span></Link>
        <small className="art-credit">Milky Way Galactic Center · NASA / ESA / Hubble / Spitzer</small>
      </div>
    </div>
  </main>;
}
