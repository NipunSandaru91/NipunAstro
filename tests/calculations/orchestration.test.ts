import {
  authorizationToken,
  calculationFailureRecord,
  errorInfo,
  isCalculationUuid,
} from "../../supabase/functions/jyotisha-calculator/orchestration.ts";

Deno.test("authorizationToken extracts a Bearer token", () => {
  if (authorizationToken("Bearer abc123") !== "abc123") throw new Error("token extraction failed");
});

Deno.test("authorizationToken rejects missing and malformed headers", () => {
  for (const value of [null, "", "Basic abc", "Bearer   "]) {
    let failed = false;
    try { authorizationToken(value); } catch (error) {
      failed = error instanceof Error && error.message === "AUTH_REQUIRED";
    }
    if (!failed) throw new Error("malformed authorization must fail");
  }
});

Deno.test("calculation UUID guard matches current API contract", () => {
  if (!isCalculationUuid("123e4567-e89b-12d3-a456-426614174000")) throw new Error("valid UUID rejected");
  if (isCalculationUuid("not-a-uuid")) throw new Error("invalid UUID accepted");
});

Deno.test("errorInfo creates a stable serializable error contract", () => {
  const info = errorInfo(Object.assign(new Error("boom"), { code: "X1", details: "detail", hint: "hint" }));
  if (info.name !== "Error" || info.message !== "boom" || info.code !== "X1" || info.details !== "detail" || info.hint !== "hint") {
    throw new Error("error contract changed");
  }
});

Deno.test("calculationFailureRecord preserves stage and error evidence", () => {
  const error = errorInfo(new Error("failed"));
  const record = calculationFailureRecord("insert_graha_positions", error);
  if (record.status !== "FAILED") throw new Error("failure status missing");
  const parsed = JSON.parse(record.error_message);
  if (parsed.stage !== "insert_graha_positions" || parsed.error.message !== "failed") {
    throw new Error("failure evidence missing");
  }
  if (record.calculation_metadata.last_failed_stage !== "insert_graha_positions") {
    throw new Error("failure stage metadata missing");
  }
});


Deno.test("errorInfo covers primitive and partial error values", () => {
  const primitive = errorInfo("plain failure");
  if (primitive.name !== "string" || primitive.message !== "plain failure") {
    throw new Error("primitive error normalization failed");
  }
  if (primitive.code !== null || primitive.details !== null || primitive.hint !== null) {
    throw new Error("primitive optional fields must default to null");
  }

  const partial = errorInfo({ name: 42, message: 99, code: "E" });
  if (partial.name !== "object" || partial.message !== "[object Object]" ||
      partial.code !== "E" || partial.details !== null || partial.hint !== null) {
    throw new Error("partial error normalization failed");
  }
});
