"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function authenticate(formData: FormData) {
  const supabase = await createClient();

  const mode = String(formData.get("mode") ?? "signin");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data.session) {
      redirect("/");
    }

    redirect("/login?message=check_email");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
