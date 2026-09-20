import { authenticate } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
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
                  Pipeline
                </p>
                <p className="mt-2 text-sm text-[#d4cfc4]">
                  Evidence → Rule → Synthesis → Prediction
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

            {params.message === "check_email" ? (
              <div className="mt-5 rounded-xl border border-[#365442] bg-[#142019] p-3 text-sm leading-6 text-[#b5d0ba]">
                Account created. Check your email to confirm the account before
                signing in.
              </div>
            ) : null}

            <form action={authenticate} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.14em] text-[#777d86]">
                  Email
                </span>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-xl border border-[#2b3038] bg-[#0d1014] px-4 py-3 text-sm text-[#eee9de] outline-none transition focus:border-[#8f7740]"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.14em] text-[#777d86]">
                  Password
                </span>

                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  className="mt-2 w-full rounded-xl border border-[#2b3038] bg-[#0d1014] px-4 py-3 text-sm text-[#eee9de] outline-none transition focus:border-[#8f7740]"
                />
              </label>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  name="mode"
                  value="signin"
                  type="submit"
                  className="rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#15130e] transition hover:brightness-110"
                >
                  Sign in
                </button>

                <button
                  name="mode"
                  value="signup"
                  type="submit"
                  className="rounded-xl border border-[#39404b] bg-[#111722] px-4 py-3 text-sm text-[#d8d3c8] transition hover:border-[#6f6041]"
                >
                  Create account
                </button>
              </div>
            </form>

            <p className="mt-6 text-xs leading-6 text-[#626872]">
              Your chart data will be isolated by authenticated ownership
              before personal Jyotiṣa calculations are exposed.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
