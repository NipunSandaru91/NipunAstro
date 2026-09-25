import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppNav({ active }: { active?: string }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const { data: roleRow } = await supabase.from("user_roles").select("role").single();
  const isAdmin = roleRow?.role === "ADMIN";

  const items = [
    ["/dashboard", "Dashboard", "dashboard"],
    ["/chart/new", "New Chart", "new"],
    ["/my-chart", "My Chart", "chart"],
    ["/profile", "Profile", "profile"],
  ] as const;
  const adminItem = isAdmin ? ([["/admin", "Admin Dashboard", "admin"]] as const) : [];
  const allItems = [...items, ...adminItem];

  return (
    <header className="sticky top-0 z-30 border-b border-[#252a31] bg-[#0a0c0f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="min-w-0">
          <p className="eyebrow">NipunAstro</p>
          <p className="serif truncate text-base text-[#eee9de]">Jyotiṣa Observatory</p>
        </Link>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#343a43] px-3 py-2 text-xs text-[#d4cfc4] transition hover:border-[#8f7740] hover:text-[#e0b65b] [&::-webkit-details-marker]:hidden">
            <span className="text-base leading-none">☰</span><span>Menu</span>
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#343a43] bg-[#0d1014] p-2 shadow-2xl">
            <div className="border-b border-[#252a31] px-3 py-3"><p className="eyebrow">Navigation</p>{email ? <p className="mt-1 truncate text-[10px] text-[#676d76]">{email}</p> : null}</div>
            <nav className="mt-2 space-y-1" aria-label="Application menu">
              {allItems.map(([href, label, key]) => <Link key={key} href={href} className={`block rounded-xl px-3 py-2.5 text-sm transition ${active === key ? "bg-[#17140e] text-[#e0b65b]" : "text-[#bdb8ad] hover:bg-[#15191f] hover:text-[#eee9de]"}`}>{label}</Link>)}
              <Link href="/profile" className="block rounded-xl px-3 py-2.5 text-sm text-[#8d929b] hover:bg-[#15191f] hover:text-[#eee9de]">Settings</Link>
            </nav>
            <div className="mt-2 border-t border-[#252a31] pt-2"><form action="/auth/signout" method="post"><button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#d8aaaa] hover:bg-[#211416]">Sign out</button></form></div>
          </div>
        </details>
      </div>
    </header>
  );
}
