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
        <span className="text-sm text-[#9ca7b3]">කේන්දර නම: <b className="text-[#eee9de]">{initialName || "නමක් නැත"}</b></span>
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
        className="min-w-[220px] flex-1 rounded-xl border border-[#b8954f] bg-[#091522] px-3 py-2.5 text-sm text-[#eee9de] outline-none"
      />
      <button type="submit" className="cosmic-primary">සුරකින්න</button>
      <button type="button" onClick={() => setEditing(false)} className="cosmic-secondary">අවලංගු</button>
    </form>
  );
}
