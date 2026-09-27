"use client";

import { useFormStatus } from "react-dom";

export default function CalculationSubmit() {
  const { pending } = useFormStatus();
  return (
    <div className="ap-submit-wrap">
      <button type="submit" disabled={pending} className="ap-primary-button ap-submit">
        {pending ? "ගණනය කරමින්…" : "ඉදිරියට"} <span>→</span>
      </button>
      {pending ? <p className="ap-submit-status">උපන් දත්ත සහ ස්ථානය සත්‍යාපනය කරමින් ග්‍රහ පිහිටීම් ගණනය කරයි…</p> : null}
    </div>
  );
}
