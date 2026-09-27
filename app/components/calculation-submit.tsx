"use client";

import { useFormStatus } from "react-dom";

export default function CalculationSubmit() {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-3">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-[#e0b65b] bg-[#e0b65b] px-4 py-3.5 text-sm font-semibold text-[#15130e] shadow-lg transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Calculating…" : "Next"}
      </button>

      {pending ? (
        <div className="rounded-2xl border border-[#34475b] bg-[#091522] p-4" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-[#b8954f]">
              <span className="h-3 w-3 animate-pulse rounded-full bg-[#e0b65b]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b8954f]">
                Calculation in progress
              </p>
              <p className="mt-1 text-xs text-[#9ca7b3]">
                Validating birth data and calculating astronomical positions…
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {["Birth", "Place", "D1", "Chart"].map((label, index) => (
              <div key={label}>
                <div className={"h-1.5 rounded-full " + (index < 3 ? "bg-[#b8954f]" : "bg-[#34475b]")} />
                <p className="mt-1.5 text-center text-[8px] text-[#687586]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
