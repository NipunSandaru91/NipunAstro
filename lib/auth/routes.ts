export const AUTH_ENTRY_PATHS = ["/", "/welcome", "/login", "/create-account"] as const;

export function isAuthEntryPath(pathname: string) {
  return (AUTH_ENTRY_PATHS as readonly string[]).includes(pathname);
}

export function shouldRedirectAuthenticatedAuthEntry(method: string, isServerAction: boolean) {
  return !(method === "POST" && isServerAction);
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (isAuthEntryPath(value) || value.startsWith("/auth")) return "/dashboard";
  return value;
}
