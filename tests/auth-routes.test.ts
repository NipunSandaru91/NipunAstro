import { isAuthEntryPath, safeNextPath } from "../lib/auth/routes.ts";

Deno.test("authenticated entry routes are recognized", () => {
  for (const path of ["/", "/welcome", "/login", "/create-account"]) {
    if (!isAuthEntryPath(path)) throw new Error("entry route not recognized: " + path);
  }
  if (isAuthEntryPath("/dashboard")) throw new Error("dashboard must not be an auth entry route");
});

Deno.test("oauth next path cannot send users back into onboarding", () => {
  for (const value of [null, "", "/", "/welcome", "/login", "/create-account", "/auth/callback", "//evil.example"]) {
    if (safeNextPath(value) !== "/dashboard") {
      throw new Error("unsafe next path did not collapse to dashboard: " + String(value));
    }
  }
  if (safeNextPath("/predictions") !== "/predictions") throw new Error("valid protected next path changed");
});
