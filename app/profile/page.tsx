import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";
import { signOut } from "@/app/auth/actions";

export async function updateProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (!userId) redirect("/login");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const language = String(formData.get("preferred_language") ?? "si");
  const timezone = String(formData.get("timezone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      preferred_language: language === "en" ? "en" : "si",
      timezone: timezone || null,
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (error) redirect("/profile?error=" + encodeURIComponent(error.message));
  redirect("/profile?saved=1");
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : "—";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, preferred_language, timezone, created_at")
    .single();

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .single();

  return (
    <>
      <AppNav active="profile" />
      <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Account Observatory</p>
          <h1 className="serif mt-2 text-4xl text-[#18372a]">පැතිකඩ</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            ගිණුම් අනන්‍යතාව, භාෂාව සහ timezone සැකසුම්. Authentication Supabase Auth මඟින් පවත්වා ගනී.
          </p>

          {params.saved ? (
            <div className="mt-6 rounded-xl border border-[#b9d8c3] bg-[#e8f4ec] p-4 text-sm text-[#176b4a]">Profile updated.</div>
          ) : null}
          {params.error ? (
            <div className="mt-6 rounded-xl border border-[#e9c5c0] bg-[#fff4f2] p-4 text-sm text-[#8b3c35]">{decodeURIComponent(params.error)}</div>
          ) : null}

          <section className="astro-card mt-7 p-6 sm:p-8">
            <div className="flex items-center gap-4 border-b border-[#d7e5da] pb-6">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full border border-[#b9d8c3] object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full border border-[#b9d8c3] bg-[#ffffff] font-serif text-xl text-[#176b4a]">
                  {(profile?.display_name ?? email).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-[#566c5e]">Authenticated account</p>
                <p className="mt-1 truncate text-sm text-[#18372a]">{email}</p>
                <p className="mt-1 text-[10px] text-[#566c5e]">Role · {roleRow?.role ?? "USER"}</p>
              </div>
            </div>

            <form action={updateProfile} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">Display name</span>
                <input name="display_name" defaultValue={profile?.display_name ?? ""} className="w-full rounded-xl border border-[#d7e5da] bg-[#ffffff] px-3 py-3 text-sm text-[#18372a] outline-none focus:border-[#b9d8c3]" />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">Preferred language</span>
                <select name="preferred_language" defaultValue={profile?.preferred_language ?? "si"} className="w-full rounded-xl border border-[#d7e5da] bg-[#ffffff] px-3 py-3 text-sm text-[#18372a] outline-none focus:border-[#b9d8c3]">
                  <option value="si">සිංහල</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#566c5e]">Timezone</span>
                <input name="timezone" defaultValue={profile?.timezone ?? "Asia/Tokyo"} placeholder="Asia/Tokyo" className="w-full rounded-xl border border-[#d7e5da] bg-[#ffffff] px-3 py-3 text-sm text-[#18372a] outline-none focus:border-[#b9d8c3]" />
              </label>

              <button type="submit" className="rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#ffffff]">
                පැතිකඩ සුරකින්න
              </button>
            </form>
          </section>

          <section className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Session</p>
                <p className="mt-2 text-xs leading-6 text-[#566c5e]">
                  මෙම device එකේ Google session එකෙන් ඉවත් වන්න.
                </p>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-xl border border-[#e9c5c0] bg-[#fff4f2] px-4 py-3 text-sm font-semibold text-[#8b3c35]"
                >
                  ගිණුමෙන් ඉවත් වන්න
                </button>
              </form>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-[#d7e5da] bg-[#ffffff] p-5">
            <p className="eyebrow">Privacy boundary</p>
            <p className="mt-2 text-xs leading-6 text-[#566c5e]">
              Profile updates are limited to the authenticated user's own profile by RLS. No other user's account data is exposed here.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
