import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";
import { SacredMarkArt } from "@/app/components/reference-art";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  return <main className="ref-screen">
    <div className="ref-phone ref-login">
      <div className="ref-login-mark"><SacredMarkArt/></div>
      <section className="ref-login-copy">
        <h1>NIPUN ASTRO</h1>
        <p>ජීවිතයේ නක්ෂත්‍ර මඟ</p>
      </section>
      {params.error?<div className="ref-error">{params.error}</div>:null}
      <div className="ref-login-actions">
        <form action={signInWithGoogle} className="space-y-3">
          <input type="hidden" name="next" value="/dashboard"/>
          <fieldset className="ref-account-type-select">
            <legend>Account type</legend>
            <label><input type="radio" name="account_type" value="PERSONAL" defaultChecked/><span><b>Personal</b><small>Simple reading</small></span></label>
            <label><input type="radio" name="account_type" value="PROFESSIONAL"/><span><b>Professional</b><small>Full analysis</small></span></label>
          </fieldset>
          <button className="ref-auth-button" type="submit"><span className="google">G</span><b>Continue with Google</b><em/></button>
        </form>
        <button className="ref-auth-button disabled" type="button" disabled><span>●</span><b>Continue with Apple</b><em>BETA</em></button>
        <button className="ref-auth-button disabled" type="button" disabled><span>✉</span><b>Continue with Email</b><em>BETA</em></button>
      </div>
      <Link href="/welcome" className="ref-login-back">← ආපසු</Link>
    </div>
  </main>;
}
