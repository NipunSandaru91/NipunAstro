import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .single();

  const accountType = profile?.account_type === "PROFESSIONAL" ? "PROFESSIONAL" : "PERSONAL";

  return <>
    <AppNav active="settings" />
    <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Account Settings</p>
        <h1 className="serif mt-2 text-4xl text-[#18372a]">සැකසුම්</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          ඔබගේ N Astro ගිණුමේ කියවීම් ප්‍රවේශය.
        </p>

        <section className="astro-card mt-7 p-6">
          <p className="text-xs uppercase tracking-[.14em] text-[#566c5e]">Current account type</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#176b4a]">{accountType}</h2>
          <p className="mt-3 text-sm leading-7 text-[#566c5e]">
            {accountType === "PERSONAL"
              ? "D1 කේන්දරය සහ පුද්ගලික සිංහල පුරෝකථන මෙතැනින් බලන්න."
              : "Professional විශ්ලේෂණයට අමතරව පුද්ගලික සිංහල පුරෝකථනද ඔබට ලබා ගත හැකියි."}
          </p>
          <p className="mt-4 border-t border-[#d7e5da] pt-4 text-xs leading-6 text-[#566c5e]">
            Account type එක පරිශීලකයාට තමන්ම මාරු කළ නොහැකියි. වෙනසක් අවශ්‍ය නම් පරිපාලකයෙකු අමතන්න.
          </p>
        </section>
      </div>
    </main>
  </>;
}
