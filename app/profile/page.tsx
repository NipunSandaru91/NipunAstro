import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/app/components/app-nav";

export async function updateProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
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
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Screen 17 · Profile</p>
          <h1 className="serif mt-2 text-4xl text-[#eee9de]">Profile</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Account identity and display preferences. Authentication remains managed by Supabase Auth.
          </p>

          {params.saved ? (
            <div className="mt-6 rounded-xl border border-[#405645] bg-[#142019] p-4 text-sm text-[#b5d0ba]">Profile updated.</div>
          ) : null}
          {params.error ? (
            <div className="mt-6 rounded-xl border border-[#5a3434] bg-[#211416] p-4 text-sm text-[#d8aaaa]">{decodeURIComponent(params.error)}</div>
          ) : null}

          <section className="panel mt-7 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-4 border-b border-[#252a31] pb-6">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full border border-[#8f7740] object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full border border-[#8f7740] bg-[#17140e] font-serif text-xl text-[#e0b65b]">
                  {(profile?.display_name ?? email).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-[#676d76]">Authenticated account</p>
                <p className="mt-1 truncate text-sm text-[#d4cfc4]">{email}</p>
                <p className="mt-1 text-[10px] text-[#676d76]">Role · {roleRow?.role ?? "USER"}</p>
              </div>
            </div>

            <form action={updateProfile} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#778392]">Display name</span>
                <input name="display_name" defaultValue={profile?.display_name ?? ""} className="w-full rounded-xl border border-[#34475b] bg-[#0a1724] px-3 py-3 text-sm text-[#d4cfc4] outline-none focus:border-[#b8954f]" />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#778392]">Preferred language</span>
                <select name="preferred_language" defaultValue={profile?.preferred_language ?? "si"} className="w-full rounded-xl border border-[#34475b] bg-[#0a1724] px-3 py-3 text-sm text-[#d4cfc4] outline-none focus:border-[#b8954f]">
                  <option value="si">සිංහල</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#778392]">Timezone</span>
                <input name="timezone" defaultValue={profile?.timezone ?? "Asia/Tokyo"} placeholder="Asia/Tokyo" className="w-full rounded-xl border border-[#34475b] bg-[#0a1724] px-3 py-3 text-sm text-[#d4cfc4] outline-none focus:border-[#b8954f]" />
              </label>

              <button type="submit" className="rounded-xl border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#15130e]">
                Save profile
              </button>
            </form>
          </section>

          <section className="mt-5 rounded-2xl border border-[#252a31] bg-[#0d1014] p-5">
            <p className="eyebrow">Privacy boundary</p>
            <p className="mt-2 text-xs leading-6 text-[#777d86]">
              Profile updates are limited to the authenticated user's own profile by RLS. No other user's account data is exposed here.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
