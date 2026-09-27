import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="reference-auth-screen login-reference">
      <div className="reference-auth-frame login-layout">
        <div className="sacred-mark" aria-hidden="true">
          <span className="diamond d1"/><span className="diamond d2"/><span className="diamond d3"/>
          <i className="sacred-core">✦</i>
        </div>
        <section className="login-copy">
          <h1>NIPUN ASTRO</h1>
          <p>ජීවිතයේ නක්ෂත්‍ර මඟ</p>
        </section>
        {params.error ? <div className="login-error">{params.error}</div> : null}
        <div className="login-actions">
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value="/dashboard" />
            <button className="reference-login-button" type="submit"><b className="google-g">G</b><span>Continue with Google</span></button>
          </form>
          <button className="reference-login-button muted" type="button" disabled aria-disabled="true"><b className="apple-g">●</b><span>Continue with Apple</span><small>Beta</small></button>
          <button className="reference-login-button muted" type="button" disabled aria-disabled="true"><b>✉</b><span>Continue with Email</span><small>Beta</small></button>
        </div>
        <Link href="/welcome" className="login-back">← ආපසු</Link>
      </div>
    </main>
  );
}
