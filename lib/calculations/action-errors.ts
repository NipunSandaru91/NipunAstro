export type SessionLike = {
  access_token: string;
};

export function hasSession(session: SessionLike | null | undefined): session is SessionLike {
  return Boolean(session);
}

export function rpcCreateError(
  error: { message?: string | null } | null,
  calculationId: string | null,
): string | null {
  if (error || !calculationId) {
    return error?.message ?? "CALCULATION_CREATE_FAILED";
  }

  return null;
}

export function engineHttpError(
  ok: boolean,
  status: number,
  detail: string,
  prefix: "ENGINE" | "TRANSIT",
): string | null {
  if (ok) return null;
  return detail || `${prefix}_HTTP_${status}`;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
