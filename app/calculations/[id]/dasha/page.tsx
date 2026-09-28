import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

type Props = { params: Promise<{ id: string }> };

type MahadasaRow = {
  id: string;
  sequence_order: number | null;
  sequence_id: number | null;
  graha_id: number;
  duration_years: number | string;
  start_at: string;
  end_at: string;
  is_birth_mahadasa?: boolean | null;
  is_balance_period?: boolean | null;
};

type AntardasaRow = {
  id: string;
  mahadasa_id: string;
  ad_sequence_order: number | null;
  sequence_id: number | null;
  graha_id: number;
  duration_years: number | string;
  start_at: string;
  end_at: string;
};

const GRAHA_SI: Record<number, string> = {
  1: "රවි",
  2: "චන්ද්‍ර",
  3: "කුජ",
  4: "බුධ",
  5: "ගුරු",
  6: "ශුක්‍ර",
  7: "ශනි",
  8: "රාහු",
  9: "කේතු",
};

function asTime(value: string) {
  return new Date(value).getTime();
}

function containsNow(start: string, end: string, now: number) {
  return asTime(start) <= now && now < asTime(end);
}

function progressPercent(start: string, end: string, now: number) {
  const s = asTime(start);
  const e = asTime(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
}

function durationLabel(start: string, end: string) {
  const days = Math.max(0, (asTime(end) - asTime(start)) / 86400000);
  const years = Math.floor(days / 365.25);
  const afterYears = days - years * 365.25;
  const months = Math.floor(afterYears / 30.4375);
  const remDays = Math.round(afterYears - months * 30.4375);

  const parts: string[] = [];
  if (years) parts.push(`${years} වසර`);
  if (months) parts.push(`${months} මාස`);
  if (!years && remDays) parts.push(`${remDays} දින`);
  return parts.join(" ") || "දින 0";
}

function formatDateTime(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  }
}

function stateFor(start: string, end: string, now: number) {
  if (containsNow(start, end, now)) return "CURRENT";
  if (now < asTime(start)) return "UPCOMING";
  return "COMPLETED";
}

export default async function DashaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("account_type").single();
  if (profile?.account_type === "PERSONAL") redirect("/dashboard");

  const { data: run } = await supabase
    .schema("jyotisha")
    .from("calculation_runs")
    .select(
      "id,subject_name,input_birth_date,input_birth_time,input_timezone,input_place_name,status",
    )
    .eq("id", id)
    .maybeSingle();

  if (!run) notFound();

  const [{ data: birth }, { data: periodRows }] = await Promise.all([
    supabase
      .schema("jyotisha")
      .from("vimshottari_birth_state")
      .select("*")
      .eq("calculation_id", id)
      .maybeSingle(),
    supabase
      .schema("jyotisha")
      .from("mahadasa_periods")
      .select("*")
      .eq("calculation_id", id)
      .order("sequence_order", { ascending: true }),
  ]);

  const periods = (periodRows ?? []) as MahadasaRow[];
  const mdIds = periods.map((row) => row.id);
  let antardasas: AntardasaRow[] = [];

  if (mdIds.length) {
    const { data: adRows } = await supabase
      .schema("jyotisha")
      .from("antardasa_periods")
      .select("*")
      .in("mahadasa_id", mdIds)
      .order("start_at", { ascending: true });
    antardasas = (adRows ?? []) as AntardasaRow[];
  }

  const now = Date.now();
  const currentMd = periods.find((row) => containsNow(row.start_at, row.end_at, now));
  const currentAds = currentMd
    ? antardasas.filter((row) => row.mahadasa_id === currentMd.id)
    : [];
  const currentAd = currentAds.find((row) => containsNow(row.start_at, row.end_at, now));
  const nextAd = currentAds.find((row) => asTime(row.start_at) > now);
  const timezone = String(run.input_timezone ?? "UTC");
  const title = run.subject_name ?? run.input_place_name ?? "Natal chart";

  return (
    <>
      <AppNav />
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <a href={"/calculations/" + id} className="text-xs text-[#b8954f]">
            ← Calculation report
          </a>

          <header className="mt-6 border-b border-[#282d35] pb-6">
            <p className="eyebrow">Daśā Analysis V2 · Vimśottarī</p>
            <h1 className="serif mt-2 text-4xl text-[#eee9de]">
              විංශෝත්තරී දශා
            </h1>
            <p className="mt-3 text-sm text-[#8f9aa7]">
              {title} · මහාදශා සහ අන්තර්දශා කාල සීමා · {timezone}
            </p>
          </header>

          {currentMd ? (
            <section className="cosmic-hero mt-6 rounded-[28px] border border-[#725626] p-6 sm:p-8">
              <p className="eyebrow">Current Daśā</p>
              <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_.8fr]">
                <div>
                  <h2 className="serif text-3xl text-[#f3dfb1] sm:text-4xl">
                    {GRAHA_SI[currentMd.graha_id] ?? currentMd.graha_id} මහාදශාව
                    {currentAd
                      ? ` · ${GRAHA_SI[currentAd.graha_id] ?? currentAd.graha_id} අන්තර්දශාව`
                      : ""}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#aeb5bd]">
                    {formatDateTime(currentMd.start_at, timezone)} →{" "}
                    {formatDateTime(currentMd.end_at, timezone)}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[.12em] text-[#7d8791]">
                      <span>Mahādaśā progress</span>
                      <span>{progressPercent(currentMd.start_at, currentMd.end_at, now).toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#242a30]">
                      <div
                        className="h-full rounded-full bg-[#d6ad55]"
                        style={{
                          width:
                            progressPercent(currentMd.start_at, currentMd.end_at, now) +
                            "%",
                        }}
                      />
                    </div>
                  </div>

                  {currentAd ? (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[.12em] text-[#7d8791]">
                        <span>Antardaśā progress</span>
                        <span>{progressPercent(currentAd.start_at, currentAd.end_at, now).toFixed(1)}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#242a30]">
                        <div
                          className="h-full rounded-full bg-[#b8954f]"
                          style={{
                            width:
                              progressPercent(currentAd.start_at, currentAd.end_at, now) +
                              "%",
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Item
                    label="මහාදශාවේ ඉතිරි කාලය"
                    value={durationLabel(new Date(now).toISOString(), currentMd.end_at)}
                  />
                  {currentAd ? (
                    <Item
                      label="අන්තර්දශාවේ ඉතිරි කාලය"
                      value={durationLabel(new Date(now).toISOString(), currentAd.end_at)}
                    />
                  ) : null}
                  <Item
                    label="ඊළඟ අන්තර්දශාව"
                    value={
                      nextAd
                        ? `${GRAHA_SI[nextAd.graha_id] ?? nextAd.graha_id} · ${formatDateTime(nextAd.start_at, timezone)}`
                        : "—"
                    }
                  />
                </div>
              </div>
            </section>
          ) : (
            <Empty text="වත්මන් දිනයට අදාළ මහාදශා period එකක් හමු නොවීය." />
          )}

          {birth ? (
            <section className="mt-5 grid gap-3 sm:grid-cols-4">
              <Item
                label="Moon longitude"
                value={String(birth.moon_longitude_sidereal) + "°"}
              />
              <Item label="Nakṣatra ID" value={String(birth.nakshatra_id)} />
              <Item label="Pada" value={String(birth.pada_id)} />
              <Item
                label="උපන් මහාදශා ශේෂය"
                value={String(birth.starting_mahadasa_years) + " years"}
              />
            </section>
          ) : (
            <Empty text="විංශෝත්තරී birth-state දත්ත නොමැත." />
          )}

          <section className="panel mt-5 rounded-2xl p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Mahādaśā + Antardaśā Timeline</p>
                <h2 className="serif mt-2 text-2xl text-[#eee9de]">
                  දශා කාල සටහන
                </h2>
              </div>
              <p className="text-xs text-[#676d76]">
                {periods.length} Mahādaśā · {antardasas.length} Antardaśā
              </p>
            </div>

            {periods.length ? (
              <div className="mt-5 space-y-3">
                {periods.map((period, index) => {
                  const state = stateFor(period.start_at, period.end_at, now);
                  const ads = antardasas.filter(
                    (row) => row.mahadasa_id === period.id,
                  );

                  return (
                    <details
                      key={period.id}
                      open={state === "CURRENT"}
                      className={
                        state === "CURRENT"
                          ? "rounded-2xl border border-[#8f7740] bg-[#15130e] p-4"
                          : "rounded-2xl border border-[#303943] bg-[#09121a] p-4"
                      }
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-[.14em] text-[#6f7881]">
                                {period.sequence_order ??
                                  period.sequence_id ??
                                  index + 1}
                              </span>
                              <StateBadge state={state} />
                            </div>
                            <h3 className="serif mt-1 text-xl text-[#eee9de]">
                              {GRAHA_SI[period.graha_id] ?? period.graha_id} මහාදශාව
                            </h3>
                            <p className="mt-1 text-xs text-[#838d97]">
                              {formatDateTime(period.start_at, timezone)} →{" "}
                              {formatDateTime(period.end_at, timezone)}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-[#c9c4b9]">
                              {durationLabel(period.start_at, period.end_at)}
                            </p>
                            <p className="mt-1 text-[10px] text-[#68717a]">
                              {ads.length} අන්තර්දශා
                            </p>
                          </div>
                        </div>
                      </summary>

                      <div className="mt-4 border-t border-[#303943] pt-4">
                        <div className="grid gap-2">
                          {ads.map((ad, adIndex) => {
                            const adState = stateFor(ad.start_at, ad.end_at, now);
                            return (
                              <div
                                key={ad.id}
                                className={
                                  adState === "CURRENT"
                                    ? "rounded-xl border border-[#725626] bg-[#17140e] p-3"
                                    : "rounded-xl border border-[#29323b] bg-[#081017] p-3"
                                }
                              >
                                <div className="grid gap-2 sm:grid-cols-[1.1fr_1fr_auto] sm:items-center">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-[#69727c]">
                                        {ad.ad_sequence_order ??
                                          ad.sequence_id ??
                                          adIndex + 1}
                                      </span>
                                      <StateBadge state={adState} />
                                    </div>
                                    <p className="mt-1 text-sm text-[#e0d7c8]">
                                      {GRAHA_SI[period.graha_id] ?? period.graha_id} /{" "}
                                      {GRAHA_SI[ad.graha_id] ?? ad.graha_id}
                                    </p>
                                  </div>
                                  <p className="font-mono text-[11px] leading-5 text-[#8d969f]">
                                    {formatDateTime(ad.start_at, timezone)}
                                    <br />
                                    {formatDateTime(ad.end_at, timezone)}
                                  </p>
                                  <p className="text-xs text-[#a9a294]">
                                    {durationLabel(ad.start_at, ad.end_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : (
              <Empty text="මහාදශා period data නොමැත." />
            )}
          </section>

          <p className="mt-5 text-xs leading-6 text-[#676d76]">
            මෙහි පෙන්වන්නේ backend Vimśottarī engine එකෙන් ගණනය කර සුරකින ලද
            Mahādaśā සහ Antardaśā time boundaries ය. Prediction meaning එක
            timing-evidence layer එකේ වෙනම aggregate කරයි.
          </p>
        </div>
      </main>
    </>
  );
}

function StateBadge({ state }: { state: "CURRENT" | "UPCOMING" | "COMPLETED" }) {
  const text =
    state === "CURRENT"
      ? "දැනට ක්‍රියාත්මක"
      : state === "UPCOMING"
        ? "ඉදිරියේ"
        : "අවසන්";
  const classes =
    state === "CURRENT"
      ? "border-[#8f7740] text-[#d8b66b]"
      : state === "UPCOMING"
        ? "border-[#34475b] text-[#8fa3b5]"
        : "border-[#2b3239] text-[#65707a]";

  return (
    <span className={"rounded-full border px-2 py-0.5 text-[9px] " + classes}>
      {text}
    </span>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#34475b] bg-[#091522] p-4">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#697787]">
        {label}
      </p>
      <p className="mt-2 text-sm text-[#c9c4b9]">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-xl border border-[#4a3d27] bg-[#15130e] p-5 text-sm text-[#c9c4b9]">
      {text}
    </div>
  );
}
