"use client";

import { useFormStatus } from "react-dom";

export default function CalculationSubmit() {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-3">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-[#b9d8c3] bg-[#176b4a] px-4 py-3.5 text-sm font-semibold text-[#ffffff] shadow-lg transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "ගණනය කරමින්…" : "කේන්දරය ගණනය කරන්න"}
      </button>

      {pending ? (
        <div className="rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-4" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-[#b9d8c3]">
              <span className="h-3 w-3 animate-pulse rounded-full bg-[#176b4a]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#176b4a]">
                ගණනය සිදුවෙමින් පවතී
              </p>
              <p className="mt-1 text-xs text-[#566c5e]">
                උපන් තොරතුරු තහවුරු කර ග්‍රහ පිහිටීම් ගණනය කරමින්…
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {["උපත", "ස්ථානය", "D1", "කේන්දරය"].map((label, index) => (
              <div key={label}>
                <div className={"h-1.5 rounded-full " + (index < 3 ? "bg-[#176b4a]" : "bg-[#f2f8f3]")} />
                <p className="mt-1.5 text-center text-[10px] text-[#566c5e]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
