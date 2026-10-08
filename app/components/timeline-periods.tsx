"use client";

import { useState, type ReactNode } from "react";

export default function TimelinePeriods({ past, future }: { past: ReactNode; future: ReactNode }) {
  const [side, setSide] = useState<"past" | "future">("future");
  return <div className="na-timeline-periods">
    <div className="na-segmented" role="group" aria-label="කාල පරාසය">
      <button type="button" aria-pressed={side === "past"} aria-controls="timeline-past" onClick={() => setSide("past")}>අතීත වසර 10</button>
      <button type="button" aria-pressed={side === "future"} aria-controls="timeline-future" onClick={() => setSide("future")}>ඉදිරි වසර 10</button>
    </div>
    <p className="na-timeline-levels">මහා දශා <span>→</span> අනුදශා <span>→</span> ප්‍රත්‍යන්තර</p>
    <div id="timeline-past" hidden={side !== "past"}>{past}</div>
    <div id="timeline-future" hidden={side !== "future"}>{future}</div>
  </div>;
}
