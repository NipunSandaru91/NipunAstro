"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateAccountType(formData: FormData) {
  const accountType = String(formData.get("account_type") ?? "").toUpperCase();
  if (accountType !== "PERSONAL" && accountType !== "PROFESSIONAL") {
    redirect("/settings?error=INVALID_ACCOUNT_TYPE");
  }
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (!userId) redirect("/login");
  const { error } = await supabase.from("profiles").update({
    account_type: accountType,
    updated_at: new Date().toISOString(),
  }).eq("id", userId).select("id").single();
  if (error) redirect("/settings?error=" + encodeURIComponent(error.message));
  redirect("/settings?saved=1");
}
