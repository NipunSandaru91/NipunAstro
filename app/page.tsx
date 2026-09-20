import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const email =
    typeof data?.claims?.email === "string"
      ? data.claims.email
      : "Authenticated user";

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#282d35] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">NipunAstro · Jyotiṣa Observatory</p>

            <h1 className="serif mt-3 text-4xl tracking-tight text-[#eee9de]">
              Observatory
            </h1>

            <p className="mt-3 text-sm text-[var(--muted)]">
              Calculation-first Jyotiṣa analysis.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-[#777d86]">{email}</p>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-[#343a43] px-3 py-2 text-xs text-[#bdb8ad] transition hover:border-[#8f7740] hover:text-[#eee9de]"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="panel rounded-2xl p-7 sm:p-9">
            <p className="eyebrow">Chart Workspace</p>

            <h2 className="serif mt-3 text-3xl text-[#eee9de]">
              No personal chart connected
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Your account is authenticated, but no user-owned Jyotiṣa
              calculation is currently attached to this account.
            </p>

            <div className="mt-8 rounded-xl border border-[#343a43] bg-[#0d1014] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#777d86]">
                Ownership boundary
              </p>

              <p className="mt-3 text-sm leading-7 text-[#d4cfc4]">
                Personal chart calculations will only be loaded after the
                calculation is securely associated with your authenticated
                account.
              </p>
            </div>
          </div>

          <aside className="panel rounded-2xl p-7">
            <p className="eyebrow">Pipeline</p>

            <div className="mt-5 space-y-4">
              {[
                ["01", "Calculation"],
                ["02", "Evidence Graph"],
                ["03", "Classical Rule"],
                ["04", "Prediction Contract"],
                ["05", "Synthesis"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="flex items-center gap-4 border-b border-[#252a31] pb-4 last:border-0"
                >
                  <span className="font-mono text-xs text-[var(--gold)]">
                    {number}
                  </span>

                  <span className="text-sm text-[#c9c4b9]">{label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="panel rounded-2xl p-5">
            <p className="eyebrow">Calculation</p>
            <p className="mt-3 text-sm text-[#d4cfc4]">
              Awaiting personal chart
            </p>
          </div>

          <div className="panel rounded-2xl p-5">
            <p className="eyebrow">Evidence</p>
            <p className="mt-3 text-sm text-[#d4cfc4]">
              Ownership protected
            </p>
          </div>

          <div className="panel rounded-2xl p-5">
            <p className="eyebrow">Prediction</p>
            <p className="mt-3 text-sm text-[#d4cfc4]">
              Awaiting verified inputs
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
