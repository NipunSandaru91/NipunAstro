import Link from "next/link";
import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { loadDeepDasha } from "@/lib/calculations/load-deep-dasha";
import {
  buildLifeTimeline,
  canViewTimeline,
  type TimelineItem,
} from "@/lib/timeline/life-timeline";
import { GRAHA } from "@/lib/daily/labels";
export const dynamic = "force-dynamic";
const LEVEL = ["මහා දශා", "අන්තර් දශා", "ප්‍රත්‍යන්තර"];

export default async function TimelinePage(
  { searchParams }: { searchParams: Promise<{ calculation?: string }> },
) {
  const { calculation } = await searchParams;
  const client = await createClient();
  const { data: claims } = await client.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login?next=%2Ftimeline");
  const { data: profile, error: profileError } = await client.from("profiles")
    .select("account_type").single();
  if (profileError || !canViewTimeline(profile?.account_type)) {
    redirect("/dashboard");
  }
  const { data: runs, error } = await client.from("user_calculation_runs_v1")
    .select("id,subject_name,status,input_timezone").order(
      "calculation_timestamp",
      { ascending: false },
    );
  if (error) throw Error("TIMELINE_CHARTS_UNAVAILABLE");
  const charts = (runs ?? []).filter((r) => r.status === "CALCULATED");
  const selected = charts.find((c) => c.id === calculation) ?? charts[0];
  const asOf = new Date().toISOString();
  let result: ReturnType<typeof buildLifeTimeline> | null = null;
  let unavailable = false;
  if (selected) {
    const [loaded, natal] = await Promise.all([
      loadDeepDasha(client, selected.id, 5),
      client.rpc("get_user_calculation_chart_v1", {
        p_calculation_id: selected.id,
      }),
    ]);
    if (natal.error || !loaded?.run.utc_timestamp || !loaded.periods.length) {
      unavailable = true;
    } else {try {
        const chart = natal.data as {
          lagna?: { rasi_id: number };
          grahas?: { graha_id: number; rasi_id: number }[];
        };
        result = buildLifeTimeline({
          lagna: Number(chart.lagna?.rasi_id),
          positions: (chart.grahas ?? []).map((g) => ({
            graha_id: Number(g.graha_id),
            rasi_id: Number(g.rasi_id),
          })),
          birthAt: loaded.run.utc_timestamp,
          asOf,
          periods: loaded.periods,
        });
      } catch {
        unavailable = true;
      }}
  }
  const timezone = selected?.input_timezone ?? "UTC";
  const date = (at: string) =>
    new Intl.DateTimeFormat("si-LK", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(at));
  const time = (at: string) =>
    new Intl.DateTimeFormat("si-LK", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(at));
  function itemCard(item: TimelineItem, index: number) {
    return (
      <li
        key={item.id}
        className="rounded-2xl border border-[#d7e5da] bg-white p-5"
      >
        <p className="text-xs text-[#64786b]">
          {index + 1} · {date(item.startAt)} – {date(item.endAt)}
        </p>
        <h3 className="mt-2 font-semibold text-[#176b4a]">{item.label}</h3>
        <p className="mt-2 text-xs font-semibold text-[#64786b]">
          {item.impactLabel} · {item.toneLabel}
        </p>
        <p className="mt-2 text-sm leading-7">{item.interpretation}</p>
        <p className="mt-2 text-xs leading-6 text-[#64786b]">
          {item.dasha.map((p) => GRAHA[p.graha_id]).join(" → ")} · ග්‍රහ අධිපතින්
          {" "}
          {item.signals}ක ජන්ම භාව සම්බන්ධතා
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-[#176b4a]">
            ජන්ම සාක්ෂි සහ දශා මට්ටම් 3
          </summary>
          <ul className="mt-3 space-y-2 text-xs leading-6">
            {item.evidence.map((text) => <li key={text}>{text}</li>)}
          </ul>
          <h4 className="mt-3 text-xs font-semibold">හොඳ/අභියෝගාත්මක පැත්ත ගණනය කළ පදනම</h4>
          <ul className="mt-2 space-y-2 text-xs leading-6">
            {item.directionEvidence.map((text) => <li key={text}>{text}</li>)}
          </ul>
          <div className="mt-3 space-y-2">
            {item.dasha.map((p) => (
              <div
                className="rounded-lg bg-[#f5f8f4] p-3 text-xs leading-6"
                key={p.path}
              >
                <strong>{LEVEL[p.level - 1]} · {GRAHA[p.graha_id]}</strong>
                <p>{time(p.start_at)} → {time(p.end_at)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-[#64786b]">
            සාමාන්‍ය දර්ශනයේ මහා, අන්තර් සහ ප්‍රත්‍යන්තර දශා පමණක් පෙන්වයි. මෙය සිදුවීමක් තහවුරු කරන
            හෝ සංඛ්‍යාත්මක සම්භාවිතාවක් දෙන ප්‍රකාශයක් නොවේ.
          </p>
        </details>
      </li>
    );
  }
  return (
    <>
      <AppNav active="predictions" />
      <main className="astro-shell min-h-screen px-4 py-6 pb-28 text-[#233e2e]">
        <div className="mx-auto max-w-4xl space-y-5">
          <header>
            <p className="text-xs tracking-widest text-[#64786b]">
              PROFESSIONAL · පරීක්ෂණ සංස්කරණය
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#176b4a]">
              ජීවන කාලරේඛාව
            </h1>
            <p className="mt-3 text-sm leading-7">
              ජන්ම කේන්දරයේ භාව සම්බන්ධතා, මහා/අන්තර් දශා සහ ඒ තුළ ප්‍රත්‍යන්තර දශා එකට ගැළපෙන
              කාල පරාස ඉස්මතු කරයි. අතීත සිදුවීම් තහවුරු කිරීමක් හෝ සංඛ්‍යාත්මක සම්භාවිතාවක් නොවේ.
            </p>
          </header>
          {!selected
            ? (
              <Link href="/chart/new" className="underline">
                මුලින් කේන්දරයක් ගණනය කරන්න
              </Link>
            )
            : (
              <form action="/timeline" className="flex gap-3">
                <label className="min-w-0 flex-1 text-sm">
                  කේන්දරය<select
                    name="calculation"
                    defaultValue={selected.id}
                    className="mt-2 w-full rounded-xl border border-[#d7e5da] bg-white p-3"
                  >
                    {charts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject_name ?? "මගේ කේන්දරය"}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="self-end rounded-xl bg-[#176b4a] px-4 py-3 text-sm text-white">
                  බලන්න
                </button>
              </form>
            )}
          {unavailable && (
            <p role="alert" className="rounded-xl bg-white p-5">
              සම්පූර්ණ ජන්ම/දශා දත්ත නොමැති නිසා කාලරේඛාව ලබාගත නොහැක. කේන්දර ගණනය පරීක්ෂා කරන්න.
            </p>
          )}
          {result && (
            <>
              <p className="text-xs leading-6 text-[#64786b]">
                සැකසූ දිනය: {date(asOf)} ·{" "}
                {timezone}. අනාගතය: අද සිට වසර 10ක්. දැන් ක්‍රියාත්මක ප්‍රත්‍යන්තර කාලය අතීත හෝ
                අනාගත ලැයිස්තුවට දෙවරක් ඇතුළත් නොකරයි.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {(["past", "future"] as const).map((side) => (
                  <section key={side}>
                    <h2 className="mb-3 text-xl font-semibold text-[#176b4a]">
                      {side === "past" ? "අතීත කාල පරාස" : "ඉදිරි කාල පරාස"} ·{" "}
                      {result[side].length}
                    </h2>
                    {result[side].length < 10 && (
                      <p className="mb-3 text-xs leading-6">
                        අවශ්‍ය සාක්ෂි සහිත වෙනස් කාල පරාස 10ක් නොමැති නිසා ලැබෙන සංඛ්‍යාව පමණක්
                        පෙන්වයි.
                      </p>
                    )}
                    <ol className="space-y-4">
                      {result[side].map((item, i) => itemCard(item, i))}
                    </ol>
                  </section>
                ))}
              </div>
              <details className="rounded-xl border border-[#d7e5da] bg-white p-5">
                <summary className="cursor-pointer text-sm text-[#176b4a]">
                  තේරීමේ පදනම සහ සීමා
                </summary>
                <p className="mt-3 text-xs leading-7">
                  පළමුව මහා සහ අන්තර් දශා දෙකම අදාළ භාව සම්බන්ධතාවක් ඇති කාල ලෙස ශ්‍රේණිගත කර ඉහළම
                  දහය දක්වා තෝරයි. ඉන්පසු එම කාල තුළ අදාළ භාවයකට සම්බන්ධ ප්‍රත්‍යන්තර දශා පමණක්
                  තබයි. අවසන් ප්‍රතිඵලය දහයට අඩු විය හැකියි. “සාක්ෂි එකතුව” යනු මෙම නියමයන් යටතේ ඇති
                  ජ්‍යොතිෂමය ගැළපීම් ගණනයි; ජීවිත බලපෑම හෝ සම්භාවිතාව මැනීමක් නොවේ.
                  අනුබල/අභියෝග ලේබලය ග්‍රහයාගේ ස්වභාවික වර්ගීකරණය සහ ලග්නයට ඇති භාව අධිපතිත්වයෙන්
                  ගණනය කරයි. චන්ද්‍ර කලාව, බුධගේ සම්බන්ධතා, ගෝචර, යෝග, දෘෂ්ටි, ග්‍රහ බල සහ සැබෑ
                  ජීවිත සිදුවීම් මෙහි ඇතුළත් නැත. එබැවින් මෙය තහවුරු වූ සිදුවීමක් හෝ වලංගු කළ
                  පුරෝකථන ආකෘතියක් නොවේ.
                </p>
              </details>
            </>
          )}
          <Link
            href="/predictions"
            className="inline-block text-sm text-[#176b4a] underline"
          >
            පුරෝකථන වෙත
          </Link>
        </div>
      </main>
    </>
  );
}
