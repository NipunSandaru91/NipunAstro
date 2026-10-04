"use client";

import { useFormStatus } from "react-dom";

export default function PredictionWindowSubmitButton({
  label,
}: {
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="cosmic-primary w-full disabled:cursor-wait disabled:opacity-65"
    >
      {pending ? "ගණනය කරමින්…" : label}
    </button>
  );
}
