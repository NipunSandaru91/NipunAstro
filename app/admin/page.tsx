import { redirect } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import AdminDeleteUserButton from "@/app/components/admin-delete-user-button";
import { createClient } from "@/lib/supabase/server";

type AdminUser = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  account_type: string;
  created_at: string;
  chart_count: number;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (!userId) redirect("/login");

  const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
  if (roleRow?.role !== "ADMIN") redirect("/dashboard");

  const { data, error } = await supabase.rpc("admin_list_users_v1");
  const users = (data ?? []) as AdminUser[];

  return <>
    <AppNav active="admin" />
    <main className="astro-shell min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Administration</p>
        <h1 className="serif mt-2 text-4xl text-[#18372a]">Admin Dashboard</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Users, account types සහ chart ownership මෙතැනින් පාලනය කරන්න.</p>

        {params.deleted ? <div className="mt-6 rounded-xl border border-[#b9d8c3] bg-[#e8f4ec] p-4 text-sm text-[#176b4a]">User account deleted.</div> : null}
        {params.error || error ? <div className="mt-6 rounded-xl border border-[#e9c5c0] bg-[#fff4f2] p-4 text-sm text-[#8b3c35]">{params.error ? decodeURIComponent(params.error) : error?.message}</div> : null}

        <section className="mt-7 grid grid-cols-3 gap-3">
          <div className="astro-card"><p className="eyebrow">Users</p><b className="mt-2 block text-2xl text-[#176b4a]">{users.length}</b></div>
          <div className="astro-card"><p className="eyebrow">Personal</p><b className="mt-2 block text-2xl text-[#176b4a]">{users.filter(x=>x.account_type==="PERSONAL").length}</b></div>
          <div className="astro-card"><p className="eyebrow">Charts</p><b className="mt-2 block text-2xl text-[#176b4a]">{users.reduce((n,x)=>n+Number(x.chart_count||0),0)}</b></div>
        </section>

        <section className="astro-card mt-5 overflow-hidden p-0">
          <div className="border-b border-[#d7e5da] px-5 py-4"><p className="eyebrow">User Management</p></div>
          <div className="divide-y divide-[#252a31]">
            {users.map((user) => {
              const isSelf = user.user_id === userId;
              return <div key={user.user_id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <b className="block truncate text-sm text-[#18372a]">{user.display_name || user.email || "Unnamed user"}</b>
                  <p className="mt-1 truncate text-xs text-[#566c5e]">{user.email || "No email"}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[.12em] text-[#566c5e]">{user.role} · {user.account_type} · {user.chart_count} charts</p>
                </div>
                {isSelf ? <span className="text-xs text-[#566c5e]">Current admin</span> : <AdminDeleteUserButton userId={user.user_id} label={user.display_name || user.email || "this user"} />}
              </div>;
            })}
          </div>
        </section>
      </div>
    </main>
  </>;
}
