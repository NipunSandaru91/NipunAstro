import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Calculation = {
  id: string;
  input_birth_date: string;
  input_birth_time: string;
  input_timezone: string;
  input_place_name: string | null;
  input_country: string | null;
  calculation_timestamp: string;
  status: string;
  engine_version: string;
  ephemeris_version: string;
  ayanamsa: string | null;
  zodiac_type: string | null;
  house_system: string | null;
  node_method: string | null;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: queryError } = await searchParams;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  const email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : "Authenticated user";

  const { data: calculations, error } = await supabase
    .from("user_calculation_runs_v1")
    .select("*")
    .order("calculation_timestamp", { ascending: false });

  const ownedCalculations = (calculations ?? []) as Calculation[];

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

        {queryError ? (
          <section className="mt-8 rounded-2xl border border-[#5a3434] bg-[#211416] p-6">
            <p className="eyebrow">Input status</p>
            <p className="mt-2 text-sm leading-7 text-[#d8aaaa]">
              {decodeURIComponent(queryError)}
            </p>
          </section>
        ) : null}

        <section className="panel mt-8 rounded-2xl p-7 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Calculation Workspace</p>
              <h2 className="serif mt-2 text-3xl text-[#eee9de]">
                Create a natal calculation
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Birth details now follow the mobile-first chart flow. The
                birthplace is selected as Country → Province / State → City / Town.
              </p>
            </div>

            <Link
              href="/chart/new"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#15130e] transition hover:brightness-110"
            >
              Create New Chart
            </Link>
          </div>
        </section>

        {error ? (
          <section className="mt-8 rounded-2xl border border-[#5a3434] bg-[#211416] p-6">
            <p className="eyebrow">Data Surface</p>
            <h2 className="serif mt-2 text-2xl text-[#eee9de]">
              Calculation data unavailable
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#d8aaaa]">
              The authenticated read surface could not be queried. No raw
              Jyotiṣa tables are exposed as a fallback.
            </p>
          </section>
        ) : ownedCalculations.length === 0 ? (
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
                  Personal calculations are loaded only through the
                  authenticated ownership surface. System and regression
                  calculations remain isolated.
                </p>
              </div>
            </div>

            <Pipeline />
          </section>
        ) : (
          <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="panel rounded-2xl p-7 sm:p-9">
              <p className="eyebrow">Personal Calculations</p>

              <h2 className="serif mt-3 text-3xl text-[#eee9de]">
                Your chart workspace
              </h2>

              <div className="mt-7 space-y-3">
                {ownedCalculations.map((calculation) => (
                  <article
                    key={calculation.id}
                    className="rounded-xl border border-[#343a43] bg-[#0d1014] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-[#777d86]">
                          Birth data
                        </p>

                        <p className="mt-2 text-sm text-[#d4cfc4]">
                          {calculation.input_birth_date}{" "}
                          {calculation.input_birth_time}
                        </p>

                        <p className="mt-1 text-xs text-[#676d76]">
                          {calculation.input_place_name ?? "Place not specified"}
                          {calculation.input_country
                            ? ` · ${calculation.input_country}`
                            : ""}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#405645] bg-[#142019] px-3 py-1 text-xs text-[#b5d0ba]">
                        {calculation.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <DataItem
                        label="Zodiac"
                        value={calculation.zodiac_type ?? "—"}
                      />
                      <DataItem
                        label="Ayanamsa"
                        value={calculation.ayanamsa ?? "—"}
                      />
                      <DataItem
                        label="House system"
                        value={calculation.house_system ?? "—"}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <Pipeline />
          </section>
        )}

        <section className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="panel rounded-2xl p-5">
            <p className="eyebrow">Ownership</p>
            <p className="mt-3 text-sm text-[#d4cfc4]">
              Authenticated
            </p>
          </div>

          <div className="panel rounded-2xl p-5">
            <p className="eyebrow">Calculations</p>
            <p className="mt-3 text-sm text-[#d4cfc4]">
              {ownedCalculations.length} owned
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

function DataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#252a31] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
        {label}
      </p>
      <p className="mt-1 text-xs text-[#c9c4b9]">{value}</p>
    </div>
  );
}

function Pipeline() {
  return (
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
  );
}
