import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel relative overflow-hidden rounded-2xl p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#8f7740]/30" />
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#e0b65b]/20" />
              <div className="absolute right-16 top-16 h-16 w-16 rounded-full border border-[#8f7740]/40" />
            </div>

            <p className="eyebrow relative">Screen 2 · Welcome</p>
            <h1 className="serif relative mt-4 text-4xl tracking-tight text-[#eee9de]">NipunAstro වෙත සාදරයෙන් පිළිගනිමු.</h1>
            <p className="relative mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
              සත්‍යාපිත ගණනය කිරීම් මත පදනම් වූ ජ්‍යොතිෂ නිරීක්ෂණාගාරයක්. ගණනය කළ දත්ත සහ අර්ථකථනය පැහැදිලිව වෙන් කර තබා ඇත.
            </p>

            <div className="relative mt-10 flex items-center justify-center py-6">
              <div className="relative grid h-48 w-48 place-items-center rounded-full border border-[#8f7740]/60 bg-[#0d1014]/80 shadow-2xl">
                <div className="absolute inset-5 rounded-full border border-[#e0b65b]/25" />
                <div className="absolute inset-10 rounded-full border border-[#8f7740]/40" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-[#e0b65b] shadow-[0_0_18px_#e0b65b]" />
                <span className="serif text-4xl text-[#e0b65b]">✦</span>
                <span className="absolute left-7 top-10 text-xs text-[#8f7740]">☉</span>
                <span className="absolute bottom-10 right-7 text-xs text-[#8f7740]">☽</span>
                <span className="absolute right-5 top-1/2 text-[10px] text-[#676d76]">♄</span>
                <span className="absolute bottom-5 left-1/2 text-[10px] text-[#676d76]">☿</span>
              </div>
            </div>

            <p className="relative text-center text-xs tracking-[0.16em] text-[#676d76]">ගණනය · සාක්ෂි · පැහැදිලි බව</p>
          </div>

          <div className="panel rounded-2xl p-7 sm:p-8">
            <p className="eyebrow">Screen 2 · Sign In</p>
            <h2 className="serif mt-2 text-2xl text-[#eee9de]">ඔබේ නිරීක්ෂණාගාරයට පිවිසෙන්න</h2>
            {params.error ? <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-3 text-sm leading-6 text-[#d8aaaa]">{params.error}</div> : null}
            <form action={signInWithGoogle} className="mt-7">
              <input type="hidden" name="next" value="/dashboard" />
              <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-4 py-3.5 text-sm font-semibold text-[#15130e] hover:brightness-110">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>
                Google සමඟ ඉදිරියට
              </button>
            </form>
            <div className="mt-5 border-t border-[#252a31] pt-5 text-center">
              <p className="text-xs text-[#676d76]">NipunAstro වෙත අලුත්ද?</p>
              <Link href="/create-account" className="mt-2 inline-block text-sm text-[#e0b65b] hover:underline">ගිණුමක් සාදන්න</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
