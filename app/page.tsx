import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";

export default function HomePage() {
  return <main className="na-entry">
    <div className="na-entry-inner">
      <div className="na-brand na-entry-brand"><BrandLogo /></div>
      <div className="na-entry-content">
        <p className="na-overline">ජ්‍යොතිෂ නිරීක්ෂණය</p>
        <h1>ඔබේ කේන්දරය,<br/>පැහැදිලිව කියවන්න.</h1>
        <p>නිවැරදි උපන් තොරතුරු මත ජන්ම ගණනයක් සාදා, ග්‍රහ පිහිටීම් සහ භාව 12 සිංහලෙන් විමසන්න.</p>
        <Link href="/welcome" className="na-button">ඉදිරියට යන්න <span aria-hidden="true">→</span></Link>
      </div>
      <p className="na-entry-foot">Lahiri · Sidereal · Whole Sign</p>
    </div>
  </main>;
}
