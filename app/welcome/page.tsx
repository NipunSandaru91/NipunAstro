import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";

export default function WelcomePage() {
  return <main className="na-public">
    <div className="na-public-inner">
      <header className="na-public-header"><Link href="/" className="na-brand"><BrandLogo /></Link></header>
      <section className="na-welcome-layout">
        <div className="na-welcome-copy">
          <p className="na-overline">ජන්ම කේන්දරය · සිංහල කියවීම</p>
          <h1>නිවැරදි දත්ත වලින් පටන්ගෙන,<br/>අර්ථය වෙත යන්න.</h1>
          <p>ගණනය සහ අර්ථකථනය පැහැදිලිව බලන්න. ඔබේ කේන්දර සුරකින්න; පසුව නැවත විවෘත කරන්න.</p>
          <Link href="/login" className="na-button">ආරම්භ කරන්න <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  </main>;
}
