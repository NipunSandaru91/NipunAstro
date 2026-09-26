import {
  engineHttpError,
  errorMessage,
  hasSession,
  rpcCreateError,
} from "../../lib/calculations/action-errors.ts";

Deno.test("session guard accepts a session and rejects null", () => {
  if (!hasSession({ access_token: "token" })) throw new Error("session should be accepted");
  if (hasSession(null)) throw new Error("null session should be rejected");
});

Deno.test("RPC create error prefers Supabase message", () => {
  const result = rpcCreateError({ message: "rpc failed" }, null);
  if (result !== "rpc failed") throw new Error("RPC message was not preserved");
});

Deno.test("RPC create error detects missing calculation id", () => {
  const result = rpcCreateError(null, null);
  if (result !== "CALCULATION_CREATE_FAILED") throw new Error("missing id must fail");
  if (rpcCreateError(null, "calc-123") !== null) throw new Error("valid id must pass");
});

Deno.test("HTTP engine error preserves response detail and has status fallback", () => {
  if (engineHttpError(false, 500, "engine detail", "ENGINE") !== "engine detail") {
    throw new Error("engine detail should win");
  }
  if (engineHttpError(false, 503, "", "ENGINE") !== "ENGINE_HTTP_503") {
    throw new Error("HTTP fallback failed");
  }
  if (engineHttpError(true, 200, "", "ENGINE") !== null) {
    throw new Error("successful response must not produce an error");
  }
});

Deno.test("runtime errors normalize Error and non-Error values", () => {
  if (errorMessage(new Error("network down")) !== "network down") {
    throw new Error("Error message normalization failed");
  }
  if (errorMessage("network down") !== "network down") {
    throw new Error("string normalization failed");
  }
});
