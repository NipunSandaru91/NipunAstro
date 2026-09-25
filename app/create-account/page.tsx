import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default function CreateAccountPage() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center">
        <section className="panel w-full rounded-2xl p-8 sm:p-10">
          <p className="eyebrow">Screen 3 · Create Account</p>
          <h1 className="serif mt-4 text-4xl text-[#eee9de]">Create your observatory account.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Beta V1 uses Google OAuth for account creation and sign-in. No second password universe is required. Humanity has enough of those.
          </p>
          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="next" value="/dashboard" />
            <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-4 py-3.5 text-sm font-semibold text-[#15130e] hover:brightness-110">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>
              Create with Google
            </button>
          </form>
          <div className="mt-6 flex justify-between border-t border-[#252a31] pt-5 text-sm">
            <Link href="/welcome" className="text-[#8d929b] hover:text-[#eee9de]">Back to Sign In</Link>
            <Link href="/" className="text-[#8d929b] hover:text-[#eee9de]">Splash</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
