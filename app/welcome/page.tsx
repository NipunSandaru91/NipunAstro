import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="reference-auth-screen welcome-reference">
      <div className="reference-auth-frame welcome-layout">
        <div className="cosmic-horizon" aria-hidden="true">
          <div className="horizon-sun" />
          <div className="horizon-arc a1" />
          <div className="horizon-arc a2" />
          <div className="horizon-arc a3" />
          <div className="horizon-zodiac">♈︎　♉︎　♊︎　♋︎　♌︎　♍︎　♎︎</div>
        </div>
        <section className="welcome-copy">
          <h1>වේද නක්ෂත්‍ර විද්‍යාවේ<br/>පුරාණ දැනුම ඔබේ ජීවිතයට</h1>
          <p>ජන්ම ගණනය, දශා, ගෝචර, රැකියා සහ ජීවන තේමාවන් එකම පැහැදිලි නිරීක්ෂණයකින්.</p>
        </section>
        <div className="welcome-controls">
          <div className="pager"><i className="active"/><i/><i/><i/></div>
          <Link href="/login" className="reference-outline-button">ආරම්භ කරන්න <span>→</span></Link>
        </div>
      </div>
    </main>
  );
}
