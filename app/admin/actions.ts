"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteAdminUser(formData: FormData) {
  const targetUserId = String(formData.get("user_id") ?? "").trim();
  if (!targetUserId) redirect("/admin?error=USER_ID_REQUIRED");

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  const { error } = await supabase.rpc("admin_delete_user_v1", {
    p_target_user_id: targetUserId,
  });

  if (error) redirect("/admin?error=" + encodeURIComponent(error.message));
  redirect("/admin?deleted=1");
}
