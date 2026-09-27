import { createCalculation } from "@/app/calculations/actions";
import LocationSelector from "@/app/components/location-selector";
import CalculationSubmit from "@/app/components/calculation-submit";
import AppNav from "@/app/components/app-nav";

export default async function NewChartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const subjectError =
    params.error === "invalid_subject_name"
      ? "කේන්දර හිමියාගේ නම ඇතුළත් කරන්න. නම අක්ෂර 120 ට අඩු විය යුතුයි."
      : null;

  return (
    <>
      <AppNav active="new" />
      <main className="astro-shell min-h-screen px-4 py-6 text-[#eee9de] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <section className="cosmic-hero rounded-[28px] border border-[#725626] p-6 sm:p-8">
            <p className="eyebrow">New Natal Chart</p>
            <h1 className="serif mt-2 text-4xl text-[#f3dfb1]">නව කේන්දරයක් සාදන්න</h1>
            <p className="mt-3 text-sm leading-7 text-[#aeb5bd]">
              කේන්දර හිමියා → උපන් තොරතුරු → ස්ථානය → සත්‍යාපිත ගණනය.
            </p>
          </section>

          <section className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Step n="1" label="කේන්දර හිමියා" active />
            <Step n="2" label="උපන් ස්ථානය" />
            <Step n="3" label="ගණනය" />
          </section>

          <section className="astro-card mt-5 p-5 sm:p-7">
            <p className="eyebrow">Birth Information</p>
            <h2 className="serif mt-2 text-2xl text-[#f0e4c8]">
              නිවැරදි උපන් තොරතුරු ඇතුළත් කරන්න
            </h2>
            <p className="mt-2 text-xs leading-6 text-[#8f98a2]">
              මෙම නම chart එක හඳුනාගැනීමට භාවිතා වේ. ස්ථානය chart title එකක් ලෙස භාවිතා නොකරයි.
            </p>

            {subjectError ? (
              <div className="mt-4 rounded-xl border border-[#6f3f3f] bg-[#211011] px-4 py-3 text-xs text-[#e0b4b4]">
                {subjectError}
              </div>
            ) : null}

            <form action={createCalculation} className="mt-6 space-y-5">
              <TextField
                label="කේන්දර හිමියාගේ නම"
                name="subject_name"
                placeholder="උදා: Nipun / Spouse / Client A"
              />
              <Field label="උපන් දිනය" name="birth_date" type="date" />
              <Field label="උපන් වේලාව" name="birth_time" type="time" />
              <div className="rounded-2xl border border-[#2b3a47] bg-[#08121b] p-4">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#c09a50]">
                  උපන් ස්ථානය
                </p>
                <LocationSelector />
              </div>
              <CalculationSubmit />
            </form>
          </section>

          <p className="mt-5 text-center text-[10px] text-[#67717b]">
            Vedic · Lahiri Sidereal · Whole Sign
          </p>
        </div>
      </main>
    </>
  );
}

function Step({
  n,
  label,
  active = false,
}: {
  n: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2 py-2 ${active ? "border-[#b8954f] bg-[#17140e]" : "border-[#293642] bg-[#09121a]"}`}
    >
      <div
        className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ${active ? "bg-[#e0b65b] text-[#15130e]" : "border border-[#425365] text-[#8f9aa7]"}`}
      >
        {n}
      </div>
      <p className="mt-1.5 text-[9px] text-[#bfc7d0]">{label}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#7f8994]">
        {label}
      </span>
      <input
        required
        name={name}
        type="text"
        maxLength={120}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#34475b] bg-[#08131d] px-3 py-3.5 text-sm text-[#ddd6ca] outline-none transition placeholder:text-[#54606d] focus:border-[#b8954f]"
      />
    </label>
  );
}

function Field({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: "date" | "time";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#7f8994]">
        {label}
      </span>
      <input
        required
        name={name}
        type={type}
        className="w-full rounded-xl border border-[#34475b] bg-[#08131d] px-3 py-3.5 text-sm text-[#ddd6ca] outline-none transition focus:border-[#b8954f]"
      />
    </label>
  );
}
