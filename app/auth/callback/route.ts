import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

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
      new URL(
        "/login?error=" + encodeURIComponent(error.message),
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
