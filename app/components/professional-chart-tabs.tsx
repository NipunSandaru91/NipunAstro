import Link from "next/link";

const sections = [
  ["overview", "සාරාංශය"],
  ["bhava", "භාව"],
  ["drishti", "දෘෂ්ටි"],
  ["planets", "ග්‍රහ"],
  ["strength", "බලය"],
  ["yoga", "යෝග"],
  ["predictions", "පුරෝකථන"],
] as const;
type Section = (typeof sections)[number][0];
type Props = { calculationId: string; active: Section | "dasha" | "transit" | "timeline" };

export default function ProfessionalChartTabs({ calculationId, active }: Props) {
  const base = `/calculations/${calculationId}`;
  const links: Array<[string, string, string]> = [
    ...sections.map(([key, label]) => [key, label, key === "overview" ? base : `${base}?tab=${key}`] as [string, string, string]),
    ["dasha", "දශා", `${base}/dasha`],
    ["transit", "ගෝචර", `${base}/transit`],
    ["timeline", "Timeline", `/timeline?calculation=${encodeURIComponent(calculationId)}`],
  ];
  return (
    <nav aria-label="කේන්දර කියවීමේ කොටස්" className="mt-6 rounded-2xl border border-[#d7e5da] bg-white p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-1" >
        {links.map(([key, label, href]) => (
          <Link key={key} href={href} aria-current={active === key ? "page" : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b99a50] ${active === key ? "bg-[#14233b] text-[#e3c77f]" : "text-[#405449] hover:bg-[#f1f5f1]"}`}>
            {label}
          </Link>
        ))}
      </div>
      <p className="px-2 pt-1 text-[11px] text-[#718176] sm:hidden">තවත් කොටස් බැලීමට පැත්තට අදින්න</p>
    </nav>
  );
}
