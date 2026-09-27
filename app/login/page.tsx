import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";
import { SacredMarkArt } from "@/app/components/reference-art";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params = await searchParams;
  return (
    <main className="ap-entry">
      <div className="ap-entry-frame ap-login">
        <div className="ap-login-stars" aria-hidden="true" />
        <section className="ap-login-brand">
          <div className="ap-sacred-wrap" aria-hidden="true"><SacredMarkArt /></div>
          <h1>NIPUN ASTRO</h1>
          <p>ජීවිතයේ නක්ෂත්‍ර මග</p>
        </section>

        {params.error ? <div className="ap-error">{params.error}</div> : null}

        <section className="ap-auth-actions">
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value="/dashboard" />
            <button className="ap-auth-button" type="submit">
              <span className="ap-google">G</span><b>Continue with Google</b><em>→</em>
            </button>
          </form>
          <button className="ap-auth-button ap-auth-muted" type="button" disabled>
            <span className="ap-apple">●</span><b>Continue with Apple</b><em>ළඟදීම</em>
          </button>
          <button className="ap-auth-button ap-auth-muted" type="button" disabled>
            <span className="ap-mail">✉</span><b>Continue with Email</b><em>ළඟදීම</em>
          </button>
          <div className="ap-login-rule" />
          <Link href="/welcome" className="ap-text-link">← ආපසු</Link>
        </section>
      </div>
    </main>
  );
}
