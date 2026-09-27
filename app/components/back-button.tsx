"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="ref-back-button"
      aria-label="පෙර පිටුවට"
      title="පෙර පිටුවට"
    >
      ←
    </button>
  );
}
