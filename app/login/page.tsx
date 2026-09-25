import { signInWithGoogle } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel rounded-2xl p-7 sm:p-10">
            <p className="eyebrow">NipunAstro · Jyotiṣa Observatory</p>

            <h1 className="serif mt-4 text-4xl tracking-tight text-[#eee9de]">
              Evidence before interpretation.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Sign in to access your calculation-first Jyotiṣa workspace.
              Chart calculations and evidence remain authoritative throughout
              the analysis pipeline.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#282d35] bg-[#0d1014] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#676d76]">
                  Calculation
                </p>
                <p className="mt-2 text-sm text-[#d4cfc4]">
                  Lahiri · Mean Nodes · Whole Sign
                </p>
              </div>

              <div className="rounded-xl border border-[#282d35] bg-[#0d1014] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#676d76]">
                  Foundation
                </p>
                <p className="mt-2 text-sm text-[#d4cfc4]">
                  D1 · Bhāva · Dṛṣṭi · Ṣaḍbala · Yoga · Daśā · Transit
                </p>
              </div>
            </div>
          </div>

          <div className="panel rounded-2xl p-7 sm:p-8">
            <p className="eyebrow">Authentication</p>

            <h2 className="serif mt-2 text-2xl text-[#eee9de]">
              Your observatory
            </h2>

            {params.error ? (
              <div className="mt-5 rounded-xl border border-[#5a3434] bg-[#211416] p-3 text-sm leading-6 text-[#d8aaaa]">
                {params.error}
              </div>
            ) : null}

            <form action={signInWithGoogle} className="mt-7">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-4 py-3.5 text-sm font-semibold text-[#15130e] transition hover:brightness-110"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">
                  G
                </span>
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-xs leading-6 text-[#626872]">
              Google authentication is the Beta V1 sign-in method. Your
              calculation data is isolated by authenticated ownership.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
