import Image from "next/image";

/** Approved N monogram with the Astro-only wordmark (design D). */
export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/n-astro-logo.png"
      alt="N Astro"
      width={compact ? 72 : 128}
      height={compact ? 72 : 128}
      className="na-logo"
      loading="eager"
      sizes={compact ? "72px" : "128px"}
    />
  );
}
