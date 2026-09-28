import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export async function updateAccountType(formData: FormData) {
  "use server";
  const accountType = String(formData.get("account_type") ?? "").toUpperCase();
  if (accountType !== "PERSONAL" && accountType !== "PROFESSIONAL") {
    redirect("/settings?error=INVALID_ACCOUNT_TYPE");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ account_type: accountType, updated_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error) redirect("/settings?error=" + encodeURIComponent(error.message));
  redirect("/settings?saved=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{saved?: string; error?: string}>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .single();

  const accountType = profile?.account_type === "PERSONAL" ? "PERSONAL" : "PROFESSIONAL";

  return <>
    <AppNav active="settings" />
    <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Account Settings</p>
        <h1 className="serif mt-2 text-4xl text-[#eee9de]">සැකසුම්</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          ඔබට පෙන්වන ජ්‍යෝතිෂ විස්තර මට්ටම මෙතැනින් තෝරන්න.
        </p>

        {params.saved ? <div className="mt-6 rounded-xl border border-[#405645] bg-[#142019] p-4 text-sm text-[#b5d0ba]">Account type updated.</div> : null}
        {params.error ? <div className="mt-6 rounded-xl border border-[#5a3434] bg-[#211416] p-4 text-sm text-[#d8aaaa]">{decodeURIComponent(params.error)}</div> : null}

        <form action={updateAccountType} className="astro-card mt-7 space-y-4">
          <p className="text-xs uppercase tracking-[.14em] text-[#778392]">Account type</p>

          <label className="block cursor-pointer rounded-2xl border border-[#3b4650] bg-[#09121a] p-5">
            <div className="flex items-start gap-3">
              <input type="radio" name="account_type" value="PERSONAL" defaultChecked={accountType==="PERSONAL"} className="mt-1 accent-[#d7b363]" />
              <div>
                <b className="text-[#f0e4c8]">Personal</b>
                <p className="mt-1 text-xs leading-6 text-[#8f969d]">Simple D1 සහ භාව 12 සඳහා පැහැදිලි synthesized descriptions. Technical evidence නොපෙන්වයි.</p>
              </div>
            </div>
          </label>

          <label className="block cursor-pointer rounded-2xl border border-[#6b542c] bg-[#12100b] p-5">
            <div className="flex items-start gap-3">
              <input type="radio" name="account_type" value="PROFESSIONAL" defaultChecked={accountType==="PROFESSIONAL"} className="mt-1 accent-[#d7b363]" />
              <div>
                <b className="text-[#f0d69c]">Professional</b>
                <p className="mt-1 text-xs leading-6 text-[#9e9688]">Full chart data, technical evidence, Daśā, Transit, Prediction සහ advanced analysis.</p>
              </div>
            </div>
          </label>

          <button type="submit" className="cosmic-primary w-full">Account type සුරකින්න</button>
        </form>
      </div>
    </main>
  </>;
}
