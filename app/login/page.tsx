import Link from "next/link";
import BrandLogo from "@/app/components/brand-logo";
import { signInWithGoogle } from "@/app/auth/actions";
import { safeNextPath } from "@/lib/auth/routes";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return <main className="na-public">
    <div className="na-login-wrap">
      <Link href="/welcome" className="na-back">← ආපසු</Link>
      <section className="na-login-card">
        <div className="na-brand"><BrandLogo /></div>
        <p className="na-overline">ඔබේ ගිණුම</p>
        <h1>ඉදිරියට පිවිසෙන්න</h1>
        <p className="na-login-lead">ඔබට ගැළපෙන කියවීමේ ආකාරය තෝරන්න. පසුව සැකසුම් තුළින් එය වෙනස් කළ හැකියි.</p>
        {params.error ? <div role="alert" className="na-error">පිවිසීම සම්පූර්ණ කළ නොහැකි විය. නැවත උත්සාහ කරන්න.</div> : null}
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={safeNextPath(params.next)}/>
          <fieldset className="na-mode-select">
            <legend>කියවීමේ ආකාරය</legend>
            <label><input type="radio" name="account_type" value="PERSONAL" defaultChecked/><span><b>Personal</b><small>D1 සහ භාව 12 · සරල සිංහල කියවීම</small></span></label>
            <label><input type="radio" name="account_type" value="PROFESSIONAL"/><span><b>Professional</b><small>ගණනය, සාක්ෂි, දශා සහ ගෝචර</small></span></label>
          </fieldset>
          <button type="submit" className="na-button na-google-button">Google සමඟ පිවිසෙන්න <span aria-hidden="true">→</span></button>
        </form>
        <p className="na-login-note">දැනට Google පිවිසුම ලබා ගත හැකියි.</p>
      </section>
    </div>
  </main>;
}
