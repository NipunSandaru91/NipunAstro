import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="splash-geometry" aria-hidden="true">
        <div className="splash-orbit splash-orbit-a" />
        <div className="splash-orbit splash-orbit-b" />
        <div className="splash-orbit splash-orbit-c" />
        <div className="splash-grid" />
        <span className="splash-node node-a" />
        <span className="splash-node node-b" />
        <span className="splash-node node-c" />
        <span className="splash-node node-d" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="eyebrow">NipunAstro · Jyotiṣa Observatory</p>
        <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-full border border-[#8f7740] bg-[#15130e]/95 shadow-2xl">
          <span className="serif text-3xl text-[#e0b65b]">N</span>
        </div>
        <h1 className="serif mt-8 text-5xl tracking-tight text-[#eee9de]">NipunAstro</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#a0a4ab]">සත්‍යාපිත ගණනය කිරීම් මත පදනම් වූ ජ්‍යොතිෂ නිරීක්ෂණාගාරයක්.</p>
        <div className="mt-10">
          <Link href="/welcome" className="inline-flex rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-7 py-3.5 text-sm font-semibold text-[#15130e] shadow-[0_0_30px_rgba(199,170,103,0.12)] transition hover:brightness-110">
            නිරීක්ෂණාගාරයට පිවිසෙන්න
          </Link>
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-[#666b73]">සත්‍යාපිත ගණනය · අර්ථකථනය වෙනම</p>
      </div>
    </main>
  );
}
