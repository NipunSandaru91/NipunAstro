import Link from "next/link";
import { createCalculation } from "@/app/calculations/actions";
import LocationSelector from "@/app/components/location-selector";
import CalculationSubmit from "@/app/components/calculation-submit";
import AppNav from "@/app/components/app-nav";

export default function NewChartPage() {
  return (
    <>
      <AppNav active="new" />
      <main className="min-h-screen px-4 py-8 text-[#eee9de] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-[#282d35] pb-6">
          <p className="eyebrow">Screen 3 · New Chart</p>
          <h1 className="serif mt-2 text-3xl text-[#eee9de]">Create New Chart</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Birth details → location → calculation. No change to the calculation engine.</p>
        </header>

        <section className="mt-7">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Step number="1" label="Birth Details" active />
            <Step number="2" label="Review" />
            <Step number="3" label="Calculate" />
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-[#24384b] bg-[#0d1b2b] p-5 shadow-2xl sm:p-6">
          <div>
            <p className="eyebrow">Birth Information</p>
            <h2 className="serif mt-2 text-2xl text-[#f2eadb]">
              Enter birth details
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#8f9aa7]">
              Select the birthplace through the three-level location hierarchy
              so the calculation receives an unambiguous place.
            </p>
          </div>

          <form action={createCalculation} className="mt-6 space-y-5">
            <Field
              label="Date of Birth"
              name="birth_date"
              type="date"
            />

            <Field
              label="Time of Birth"
              name="birth_time"
              type="time"
            />

            <div className="rounded-2xl border border-[#24384b] bg-[#091522] p-4">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b8954f]">
                Place of Birth
              </p>

              <LocationSelector />
            </div>

            <CalculationSubmit />
          </form>
        </section>

        <p className="mt-5 text-center text-[10px] leading-5 text-[#687586]">
          Vedic · Lahiri Sidereal · Whole Sign
        </p>
      </div>
      </main>
    </>
  );
}

function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-2 py-2 ${
      active
        ? "border-[#b8954f] bg-[#182a3b]"
        : "border-[#24384b] bg-[#0d1b2b]"
    }`}>
      <div
        className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ${
          active
            ? "bg-[#e0b65b] text-[#15130e]"
            : "border border-[#425365] text-[#8f9aa7]"
        }`}
      >
        {number}
      </div>
      <p className="mt-1.5 text-[9px] text-[#bfc7d0]">{label}</p>
    </div>
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
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#778392]">
        {label}
      </span>
      <input
        required
        name={name}
        type={type}
        className="w-full rounded-xl border border-[#34475b] bg-[#0a1724] px-3 py-3.5 text-sm text-[#d4cfc4] outline-none transition focus:border-[#b8954f]"
      />
    </label>
  );
}
