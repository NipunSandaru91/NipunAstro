export type ErrorInfo = {
  name: string;
  message: string;
  code: unknown;
  details: unknown;
  hint: unknown;
};

export function authorizationToken(header: string | null): string {
  if (!header?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("AUTH_REQUIRED");
  return token;
}

export function isCalculationUuid(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

export function errorInfo(error: unknown): ErrorInfo {
  const value = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    details?: unknown;
    hint?: unknown;
  } | null;

  return {
    name: typeof value?.name === "string" ? value.name : typeof error,
    message: typeof value?.message === "string" ? value.message : String(error),
    code: value?.code ?? null,
    details: value?.details ?? null,
    hint: value?.hint ?? null,
  };
}

export function calculationFailureRecord(stage: string, error: ErrorInfo) {
  return {
    status: "FAILED" as const,
    error_message: JSON.stringify({ stage, error }),
    calculation_metadata: {
      last_failed_stage: stage,
      last_error: error,
    },
  };
}
