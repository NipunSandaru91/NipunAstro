"use client";

import { deleteChart } from "@/app/calculations/actions";

export default function DeleteChartButton({
  calculationId,
  label = "මකන්න",
}: {
  calculationId: string;
  label?: string;
}) {
  return (
    <form
      action={deleteChart}
      onSubmit={(event) => {
        if (!window.confirm("මෙම කේන්දරය මගේ කේන්දර ලැයිස්තුවෙන් මකන්නද?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="calculation_id" value={calculationId} />
      <button
        type="submit"
        className="rounded-xl border border-[#6a3b3b] bg-[#1b1113] px-3 py-2 text-xs font-semibold text-[#d8aaaa]"
      >
        {label}
      </button>
    </form>
  );
}
