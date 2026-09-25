import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel rounded-2xl p-8 sm:p-10">
            <p className="eyebrow">Screen 2 · Welcome</p>
            <h1 className="serif mt-4 text-4xl tracking-tight text-[#eee9de]">Welcome to NipunAstro.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
              A calculation-first Jyotiṣa workspace built around verified astronomical inputs and a deliberately separate interpretation layer.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[["D1","Rāśi"],["Daśā","Vimśottarī"],["Transit","Verified positions"]].map(([a,b]) => (
                <div key={a} className="rounded-xl border border-[#282d35] bg-[#0d1014] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[#676d76]">{a}</p><p className="mt-2 text-sm text-[#d4cfc4]">{b}</p></div>
              ))}
            </div>
          </div>
          <div className="panel rounded-2xl p-7 sm:p-8">
            <p className="eyebrow">Screen 2 · Sign In</p>
            <h2 className="serif mt-2 text-2xl text-[#eee9de]">Enter your observatory</h2>
            {params.error ? <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-3 text-sm leading-6 text-[#d8aaaa]">{params.error}</div> : null}
            <form action={signInWithGoogle} className="mt-7">
              <input type="hidden" name="next" value="/dashboard" />
              <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-4 py-3.5 text-sm font-semibold text-[#15130e] hover:brightness-110">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>
                Continue with Google
              </button>
            </form>
            <div className="mt-5 border-t border-[#252a31] pt-5 text-center">
              <p className="text-xs text-[#676d76]">New to NipunAstro?</p>
              <Link href="/create-account" className="mt-2 inline-block text-sm text-[#e0b65b] hover:underline">Create account</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
