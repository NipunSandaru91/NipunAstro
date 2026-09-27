import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params = await searchParams;
  return (
    <main className="na-entry-screen">
      <div className="na-entry-frame na-login">
        <img className="na-login-sky" src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Earth_in_a_cosmology.jpg" alt="" aria-hidden="true" />
        <div className="na-login-haze" aria-hidden="true" />
        <section className="na-login-brand si-text">
          <div className="na-sacred-mark" aria-hidden="true"><i/><i/><span>✦</span></div>
          <h1>NIPUN ASTRO</h1>
          <p>ජ්‍යෝතිෂය, ජීවිතයට දෘෂ්ටියක්</p>
        </section>
        {params.error ? <div className="na-error">{params.error}</div> : null}
        <div className="na-login-actions si-text">
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value="/dashboard" />
            <button className="na-auth-button" type="submit"><span className="na-google">G</span><b>Google සමඟ පිවිසෙන්න</b><em>→</em></button>
          </form>
          <p className="na-login-note">එක් වරක් sign in කළ පසු නැවත Welcome/Login flow එකට යන්නේ නැහැ.</p>
          <Link href="/welcome" className="na-back-link">← ආපසු</Link>
        </div>
      </div>
    </main>
  );
}
