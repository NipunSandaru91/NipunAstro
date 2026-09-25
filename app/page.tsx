import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow">NipunAstro · Jyotiṣa Observatory</p>
        <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-full border border-[#8f7740] bg-[#15130e] shadow-2xl">
          <span className="serif text-3xl text-[#e0b65b]">N</span>
        </div>
        <h1 className="serif mt-8 text-5xl tracking-tight text-[#eee9de]">NipunAstro</h1>
        <p className="mt-4 text-sm leading-7 text-[#8d929b]">A calculation-first Jyotiṣa observatory.</p>
        <div className="mt-10">
          <Link href="/welcome" className="inline-flex rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-7 py-3.5 text-sm font-semibold text-[#15130e] hover:brightness-110">
            Enter Observatory
          </Link>
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-[#555b65]">Verified calculation · Interpretation kept separate</p>
      </div>
    </main>
  );
}
