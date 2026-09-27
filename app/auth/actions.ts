"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/routes";

async function getSiteOrigin() {
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const safeNext = safeNextPath(String(formData?.get("next") ?? "/dashboard"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });

  if (error || !data.url) {
    redirect("/login?error=" + encodeURIComponent(error?.message ?? "GOOGLE_OAUTH_INIT_FAILED"));
  }

  redirect(data.url);
}


export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
