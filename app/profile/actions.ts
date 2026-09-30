"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (!userId) redirect("/login");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const language = String(formData.get("preferred_language") ?? "si");
  const timezone = String(formData.get("timezone") ?? "").trim();
  const { error } = await supabase.from("profiles").update({
    display_name: displayName || null,
    preferred_language: language === "en" ? "en" : "si",
    timezone: timezone || null,
  }).eq("id", userId).select("id").single();
  if (error) redirect("/profile?error=" + encodeURIComponent(error.message));
  redirect("/profile?saved=1");
}
