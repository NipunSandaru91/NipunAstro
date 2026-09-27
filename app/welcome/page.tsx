import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="astro-shell relative min-h-screen overflow-hidden px-5 py-10 sm:px-8">
      <div className="cosmic-stars" aria-hidden="true" />
      <div className="mx-auto flex min-h-[82vh] max-w-5xl items-center">
        <section className="relative z-10 grid w-full gap-6 lg:grid-cols-[1.08fr_.92fr]">
          <div className="cosmic-hero rounded-[30px] border border-[#71562c] p-8 sm:p-10">
            <p className="eyebrow">NipunAstro · Jyotiṣa Observatory</p>
            <h1 className="serif mt-4 max-w-2xl text-4xl leading-tight text-[#f3e7cc] sm:text-5xl">ජ්‍යොතිෂ ගණනය, සාක්ෂි සහ අර්ථකථනය එකම නිරීක්ෂණාගාරයක.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#aeb5bd]">සත්‍යාපිත ගණනය කිරීම් මත පදනම්ව, කේන්දර දත්ත සහ පුරෝකථන හේතු දෘශ්‍යමානව වෙන් කර පෙන්වන සිංහල-මුල් අත්දැකීමක්.</p>

            <div className="relative mt-10 grid min-h-64 place-items-center">
              <div className="sage-orbit" aria-hidden="true">
                <span className="sage-core">ॐ</span>
                <i className="planet p1">☉</i><i className="planet p2">☽</i><i className="planet p3">♃</i><i className="planet p4">♄</i>
              </div>
            </div>
            <p className="text-center text-[10px] uppercase tracking-[.2em] text-[#6e7680]">ගණනය · සාක්ෂි · පැහැදිලි අර්ථකථනය</p>
          </div>

          <div className="astro-card self-center p-7 sm:p-8">
            <p className="eyebrow">පිවිසුම</p>
            <h2 className="serif mt-2 text-3xl text-[#f0e4c8]">ඔබේ නිරීක්ෂණාගාරයට පිවිසෙන්න</h2>
            <p className="mt-3 text-sm leading-7 text-[#939ba4]">ඔබේ කේන්දර, ගණනය සහ පුරෝකථන එකම account එකෙන් පවත්වා ගන්න.</p>
            {params.error ? <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-3 text-sm leading-6 text-[#d8aaaa]">{params.error}</div> : null}
            <form action={signInWithGoogle} className="mt-7">
              <input type="hidden" name="next" value="/dashboard" />
              <button type="submit" className="cosmic-primary w-full">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>
                Google සමඟ ඉදිරියට
              </button>
            </form>
            <div className="mt-6 border-t border-[#27303a] pt-5 text-center">
              <p className="text-xs text-[#707780]">NipunAstro වෙත අලුත්ද?</p>
              <Link href="/create-account" className="mt-2 inline-block text-sm text-[#e0b65b] hover:underline">ගිණුමක් සාදන්න</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
