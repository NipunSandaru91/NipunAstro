import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppNav({ active }: { active?: string }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const { data: roleRow } = await supabase.from("user_roles").select("role").single();
  const isAdmin = roleRow?.role === "ADMIN";

  const items = [
    ["/dashboard", "මුල් පුවරුව", "dashboard"],
    ["/chart/new", "නව කේන්දරය", "new"],
    ["/my-chart", "මගේ කේන්දර", "chart"],
    ["/predictions", "පුරෝකථන", "predictions"],
    ["/profile", "පැතිකඩ", "profile"],
  ] as const;
  const adminItem = isAdmin ? ([["/admin", "පරිපාලන පුවරුව", "admin"]] as const) : [];
  const allItems = [...items, ...adminItem];

  return (
    <header className="cosmic-nav sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="group min-w-0">
          <div className="flex items-center gap-3">
            <span className="brand-orbit" aria-hidden="true"><i>✦</i></span>
            <div>
              <p className="eyebrow">NipunAstro</p>
              <p className="serif truncate text-base text-[#f3e7cc]">Jyotiṣa Observatory</p>
            </div>
          </div>
        </Link>
        <details className="relative">
          <summary className="cosmic-menu-button [&::-webkit-details-marker]:hidden">
            <span className="text-base leading-none">☰</span><span>මෙනුව</span>
          </summary>
          <div className="cosmic-menu-panel absolute right-0 mt-2 w-64 p-2">
            <div className="border-b border-[#26303a] px-3 py-3">
              <p className="eyebrow">Navigation</p>
              {email ? <p className="mt-1 truncate text-[10px] text-[#747d87]">{email}</p> : null}
            </div>
            <nav className="mt-2 space-y-1" aria-label="Application menu">
              {allItems.map(([href, label, key]) => (
                <Link key={key} href={href} className={`cosmic-nav-link ${active === key ? "active" : ""}`}>
                  {label}
                </Link>
              ))}
              <Link href="/profile" className="cosmic-nav-link">සැකසුම්</Link>
            </nav>
            <div className="mt-2 border-t border-[#26303a] pt-2">
              <form action="/auth/signout" method="post">
                <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#d8aaaa] transition hover:bg-[#211416]">ඉවත් වන්න</button>
              </form>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
