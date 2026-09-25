import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppNav({ active }: { active?: string }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const { data: roleRow } = await supabase.from("user_roles").select("role").single();
  const isAdmin = roleRow?.role === "ADMIN";

  const items = [
    ["/", "Dashboard", "dashboard"],
    ["/chart/new", "New Chart", "new"],
    ["/my-chart", "My Chart", "chart"],
    ["/profile", "Profile", "profile"],
  ] as const;
  const adminItem = isAdmin ? ([["/admin", "Admin", "admin"]] as const) : [];
  const allItems = [...items, ...adminItem];

  return (
    <header className="sticky top-0 z-20 border-b border-[#252a31] bg-[#0a0c0f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0">
          <p className="eyebrow">NipunAstro</p>
          <p className="serif truncate text-base text-[#eee9de]">Jyotiṣa Observatory</p>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {allItems.map(([href, label, key]) => (
            <Link
              key={key}
              href={href}
              className={`rounded-lg px-3 py-2 text-xs transition ${active === key
                ? "bg-[#17140e] text-[#e0b65b]"
                : "text-[#8d929b] hover:bg-[#15191f] hover:text-[#eee9de]"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {email ? <span className="max-w-44 truncate text-[10px] text-[#676d76]">{email}</span> : null}
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-[#343a43] px-3 py-2 text-[10px] text-[#bdb8ad] hover:border-[#8f7740]">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav className="grid grid-cols-4 border-t border-[#1d2127] md:hidden" aria-label="Mobile">
        {allItems.map(([href, label, key]) => (
          <Link
            key={key}
            href={href}
            className={`px-2 py-3 text-center text-[10px] ${active === key ? "text-[#e0b65b]" : "text-[#737982]"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
