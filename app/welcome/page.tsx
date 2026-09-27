import Link from "next/link";
import { CosmicHorizonArt } from "@/app/components/reference-art";

export default function WelcomePage(){
  return <main className="ref-screen">
    <div className="ref-phone ref-welcome">
      <div className="ref-welcome-art"><CosmicHorizonArt/></div>
      <section className="ref-welcome-copy">
        <h1>වේද නක්ෂත්‍ර විද්‍යාවේ<br/>පුරාණ දැනුම ඔබේ<br/>ජීවිතයට</h1>
        <p>ජන්ම ගණනය, දශා, ගෝචර, රැකියා සහ ජීවන තේමාවන් එකම පැහැදිලි නිරීක්ෂණයකින්.</p>
      </section>
      <div className="ref-welcome-footer">
        <div className="ref-pager"><i className="active"/><i/><i/><i/></div>
        <Link href="/login" className="ref-pill-button">ආරම්භ කරන්න <span>→</span></Link>
      </div>
    </div>
  </main>;
}
