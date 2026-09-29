import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";

const steps = [
  ["01", "උපන් තොරතුරු", "දිනය, වේලාව සහ ස්ථානය ඇතුළත් කරන්න."],
  ["02", "ජන්ම ගණනය", "D1 සහ ග්‍රහ පිහිටීම් පරීක්ෂා කරන්න."],
  ["03", "සිංහල කියවීම", "භාව 12 සඳහා පැහැදිලි අර්ථකථන බලන්න."],
] as const;

export default function WelcomePage() {
  return <main className="na-public">
    <div className="na-public-inner">
      <header className="na-public-header"><Link href="/" className="na-brand"><BrandLogo /></Link></header>
      <section className="na-welcome-layout">
        <div className="na-welcome-copy">
          <p className="na-overline">ජන්ම කේන්දරය · සිංහල කියවීම</p>
          <h1>දත්තෙන් පටන්ගෙන,<br/>අර්ථය වෙත යන්න.</h1>
          <p>ගණනය සහ අර්ථකථනය පැහැදිලි පියවරවලින් බලන්න. ඔබේ කේන්දර සුරකින්න; පසුව නැවත විවෘත කරන්න.</p>
          <Link href="/login" className="na-button">ආරම්භ කරන්න <span aria-hidden="true">→</span></Link>
        </div>
        <ol className="na-step-list">{steps.map(([number,title,description])=>
          <li key={number}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></li>
        )}</ol>
      </section>
    </div>
  </main>;
}
