import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/routes";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const requestedType = requestUrl.searchParams.get("account_type")?.toUpperCase();
  const accountType = requestedType === "PROFESSIONAL" ? "PROFESSIONAL" : "PERSONAL";

  if (!code) {
    const error = requestUrl.searchParams.get("error_description") ??
      requestUrl.searchParams.get("error") ??
      "OAUTH_CALLBACK_FAILED";

    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(error), request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(error.message), request.url),
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ account_type: accountType, updated_at: new Date().toISOString() })
    .select("id")
    .single();

  if (profileError) {
    return NextResponse.redirect(
      new URL("/settings?error=" + encodeURIComponent(profileError.message), request.url),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
