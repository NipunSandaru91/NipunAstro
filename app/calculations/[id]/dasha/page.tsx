import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

const GRAHA_SI: Record<number, string> = {
  1: "රවි", 2: "චන්ද්‍ර", 3: "කුජ", 4: "බුධ", 5: "ගුරු",
  6: "ශුක්‍ර", 7: "ශනි", 8: "රාහු", 9: "කේතු",
};

export default async function DashaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: run } = await supabase.schema("jyotisha").from("calculation_runs")
    .select("id,input_birth_date,input_birth_time,input_timezone,input_place_name,status")
    .eq("id", id).maybeSingle();
  if (!run) notFound();

  const { data: birth } = await supabase.schema("jyotisha").from("vimshottari_birth_state")
    .select("*").eq("calculation_id", id).maybeSingle();
  const { data: periods } = await supabase.schema("jyotisha").from("mahadasa_periods")
    .select("*").eq("calculation_id", id).order("sequence_order", { ascending: true });

  return <main className="min-h-screen px-5 py-10 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <a href={"/calculations/" + id} className="text-xs text-[#b8954f]">← Chart</a>
      <header className="mt-6 border-b border-[#282d35] pb-6">
        <p className="eyebrow">Screen 14 · Vimśottarī Daśā</p>
        <h1 className="serif mt-2 text-4xl text-[#eee9de]">විංශෝත්තරී දශා</h1>
        <p className="mt-3 text-sm text-[#8f9aa7]">Vimśottarī Engine V1 · Calculation layer only</p>
      </header>

      {birth ? <section className="mt-6 grid gap-3 sm:grid-cols-4">
        <Item label="Moon longitude" value={String(birth.moon_longitude_sidereal) + "°"} />
        <Item label="Nakṣatra ID" value={String(birth.nakshatra_id)} />
        <Item label="Pada" value={String(birth.pada_id)} />
        <Item label="Starting balance" value={String(birth.starting_mahadasa_years) + " years"} />
      </section> : <Empty text="විංශෝත්තරී birth-state දත්ත නොමැත." />}

      <section className="panel mt-5 rounded-2xl p-5 sm:p-7">
        <h2 className="serif text-2xl text-[#eee9de]">මහාදශා අනුක්‍රමය</h2>
        {periods?.length ? <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[#343a43] text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
              <tr><th className="px-3 py-3">අනුක්‍රමය</th><th className="px-3 py-3">ග්‍රහයා</th><th className="px-3 py-3">කාලය</th><th className="px-3 py-3">ආරම්භය</th><th className="px-3 py-3">අවසානය</th></tr>
            </thead>
            <tbody>{periods.map((p, i) => <tr key={p.id ?? i} className="border-b border-[#252a31] last:border-0">
              <td className="px-3 py-4">{p.sequence_order ?? p.sequence_id ?? i + 1}</td>
              <td className="px-3 py-4 text-[#eee9de]">{GRAHA_SI[Number(p.graha_id)] ?? p.graha_id}</td>
              <td className="px-3 py-4">{p.duration_years} years</td>
              <td className="px-3 py-4 font-mono text-xs">{p.start_at}</td>
              <td className="px-3 py-4 font-mono text-xs">{p.end_at}</td>
            </tr>)}</tbody>
          </table>
        </div> : <Empty text="මහාදශා period data නොමැත." />}
      </section>

      <p className="mt-5 text-xs leading-6 text-[#676d76]">මෙය ගණනය කළ Vimśottarī Mahādaśā output එකයි. Antardaśā හෝ फलादेश මෙහි අනුමාන නොකරයි.</p>
    </div>
  </main>;
}

function Item({label,value}:{label:string,value:string}) {
  return <div className="rounded-xl border border-[#34475b] bg-[#091522] p-4"><p className="text-[9px] uppercase tracking-[0.14em] text-[#697787]">{label}</p><p className="mt-2 text-sm text-[#c9c4b9]">{value}</p></div>;
}
function Empty({text}:{text:string}) { return <div className="mt-5 rounded-xl border border-[#4a3d27] bg-[#15130e] p-5 text-sm text-[#c9c4b9]">{text}</div>; }
