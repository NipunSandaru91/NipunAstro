"use client";

import { useState } from "react";
import { updateChartSubjectName } from "@/app/calculations/actions";

export default function ChartNameEditor({
  calculationId,
  initialName,
}: {
  calculationId: string;
  initialName: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#566c5e]">කේන්දර නම: <b className="text-[#18372a]">{initialName || "නමක් නැත"}</b></span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="cosmic-secondary"
        >
          ✎ නම වෙනස් කරන්න
        </button>
      </div>
    );
  }

  return (
    <form action={updateChartSubjectName} className="mt-4 flex max-w-xl flex-wrap gap-2">
      <input type="hidden" name="calculation_id" value={calculationId} />
      <input
        autoFocus
        name="subject_name"
        defaultValue={initialName}
        maxLength={120}
        required
        aria-label="කේන්දර හිමියාගේ නම"
        className="min-w-[220px] flex-1 rounded-xl border border-[#b9d8c3] bg-[#ffffff] px-3 py-2.5 text-sm text-[#18372a] outline-none"
      />
      <button type="submit" className="cosmic-primary">සුරකින්න</button>
      <button type="button" onClick={() => setEditing(false)} className="cosmic-secondary">අවලංගු</button>
    </form>
  );
}
