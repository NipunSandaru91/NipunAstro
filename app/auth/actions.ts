"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getSiteOrigin() {
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const next = String(formData?.get("next") ?? "/dashboard");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });

  if (error || !data.url) {
    redirect("/welcome?error=" + encodeURIComponent(error?.message ?? "GOOGLE_OAUTH_INIT_FAILED"));
  }

  redirect(data.url);
}
