import {
  buildNatalEngineRequest,
  buildTransitEngineRequest,
  normalizeTransitNodeMethod,
  validateTransitInput,
} from "../../lib/calculations/action-contract.ts";

Deno.test("natal engine request contains only the calculator contract fields", () => {
  const request = buildNatalEngineRequest("calc-123");
  if (JSON.stringify(request) !== JSON.stringify({ mode: "natal", calculation_id: "calc-123" })) {
    throw new Error("unexpected natal request");
  }
});

Deno.test("transit node method accepts TRUE and defaults everything else to MEAN", () => {
  if (normalizeTransitNodeMethod("true") !== "TRUE") throw new Error("TRUE normalization failed");
  if (normalizeTransitNodeMethod("MEAN") !== "MEAN") throw new Error("MEAN normalization failed");
  if (normalizeTransitNodeMethod("invalid") !== "MEAN") throw new Error("invalid value must default to MEAN");
});

Deno.test("transit input rejects missing required fields", () => {
  const result = validateTransitInput({
    calculationId: "",
    transitDate: "2026-09-26",
    transitTime: "12:00",
    timezone: "Asia/Colombo",
  });
  if (result.ok) throw new Error("missing calculation id must fail");
});

Deno.test("transit input accepts a complete request", () => {
  const result = validateTransitInput({
    calculationId: "calc-123",
    transitDate: "2026-09-26",
    transitTime: "12:00",
    timezone: "Asia/Colombo",
  });
  if (!result.ok) throw new Error("complete transit input must pass");
});

Deno.test("transit engine request normalizes node method", () => {
  const request = buildTransitEngineRequest({
    calculationId: "calc-123",
    transitDate: "2026-09-26",
    transitTime: "12:00",
    timezone: "Asia/Colombo",
    nodeMethod: "true",
  });
  const expected = {
    mode: "transit",
    calculation_id: "calc-123",
    transit_date: "2026-09-26",
    transit_time: "12:00",
    timezone: "Asia/Colombo",
    node_method: "TRUE",
  };
  if (JSON.stringify(request) !== JSON.stringify(expected)) throw new Error("unexpected transit request");
});
