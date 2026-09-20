type MetricProps = {
  label: string;
  value: string;
  detail: string;
};

const metrics: MetricProps[] = [
  { label: "Evidence", value: "210", detail: "Verified nodes" },
  { label: "Matched rules", value: "1", detail: "Classical conditions" },
  { label: "Eligible synthesis", value: "1", detail: "Prediction input" },
  { label: "Confidence", value: "—", detail: "Not materialized" },
];

const chartFacts = [
  ["Birth", "06 Apr 1991 · 14:12"],
  ["Place", "Colombo, Sri Lanka"],
  ["Ascendant", "Cancer · 20°22′"],
  ["Ayanāṃśa", "Lahiri"],
  ["Nodes", "Mean"],
  ["House system", "Whole Sign"],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        <header className="border-b border-[var(--border)] pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">
                NipunAstro · Jyotiṣa Observatory
              </p>

              <h1 className="serif mt-3 text-4xl tracking-tight text-[#eee9de] sm:text-5xl">
                Evidence before interpretation.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                A calculation-first workspace where chart calculations,
                classical rules, modifiers and synthesis remain traceable
                to their evidence.
              </p>
            </div>

            <div className="rounded-full border border-[#384252] bg-[#111722] px-4 py-2 text-xs text-[#a9b7c9]">
              D1 · Lahiri · Mean Nodes · Whole Sign
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">

          <article className="panel rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Primary synthesis</p>

                <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                  Relationship significations
                </h2>
              </div>

              <span className="rounded-full border border-[#365442] bg-[#142019] px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.15em] text-[#9fc2a5]">
                ELIGIBLE
              </span>
            </div>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#e2ddd2]">
              7th-house relationship significations are supported by a
              source-backed classical condition: the 7th lord is placed
              in its own sign.
            </p>

            <div className="mt-7 border-l-2 border-[var(--gold)] pl-5">
              <p className="text-sm leading-7 text-[var(--muted)]">
                Available modifiers qualify the primary structural claim;
                they do not replace the source-backed rule.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <EvidenceChip label="Source" value="BPHS" />
              <EvidenceChip label="Rule" value="BHAVA7_LORD_OWN" />
              <EvidenceChip label="Conflict" value="None" />
            </div>
          </article>

          <aside className="panel rounded-2xl p-6 sm:p-8">
            <p className="eyebrow">Chart identity</p>

            <h2 className="serif mt-2 text-2xl">
              Nipun Wattuhewa
            </h2>

            <dl className="mt-7 space-y-4">
              {chartFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-5 border-b border-[#20242b] pb-3"
                >
                  <dt className="text-xs uppercase tracking-[0.14em] text-[#707680]">
                    {label}
                  </dt>

                  <dd className="text-right text-sm text-[#d8d3c8]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <Panel
            title="Classical rule"
            value="BPHS"
            detail="7th lord in own sign / exaltation"
          />

          <Panel
            title="Modifiers"
            value="22"
            detail="Dasha, transit, sphuṭa and varga links"
          />

          <Panel
            title="Provenance"
            value="Complete"
            detail="Source facts preserved through synthesis"
          />
        </section>

        <section className="panel mt-5 rounded-2xl p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Pipeline</p>

              <h2 className="serif mt-2 text-xl">
                Calculation to prediction
              </h2>
            </div>

            <span className="text-xs text-[#727780]">
              Read-only frontend slice
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Calculation",
              "Evidence Graph",
              "Classical Rule",
              "Deduplication",
              "Conflict",
              "Modifiers",
              "Synthesis",
              "Prediction Output",
            ].map((item, index) => (
              <span
                key={item}
                className="rounded-lg border border-[#2b3038] bg-[#0d1014] px-3 py-2 text-xs text-[#a9adb5]"
              >
                <span className="mr-2 text-[var(--gold)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item}
              </span>
            ))}
          </div>
        </section>

        <footer className="py-8 text-xs text-[#5f646c]">
          NipunAstro · calculation and evidence remain authoritative;
          synthesis does not write back into the evidence graph.
        </footer>

      </div>
    </main>
  );
}

function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#777d86]">
        {label}
      </p>

      <p className="serif mt-3 text-3xl text-[var(--gold)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#777d86]">
        {detail}
      </p>
    </div>
  );
}

function EvidenceChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#282d35] bg-[#0d1014] p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#676d76]">
        {label}
      </p>

      <p className="mt-2 text-sm text-[#d4cfc4]">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel rounded-2xl p-6">
      <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#777d86]">
        {title}
      </p>

      <p className="serif mt-3 text-2xl text-[var(--gold)]">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-[#777d86]">
        {detail}
      </p>
    </div>
  );
}
