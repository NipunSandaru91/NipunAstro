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
        className="rounded-xl border border-[#e9c5c0] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[#8b3c35]"
      >
        {label}
      </button>
    </form>
  );
}
