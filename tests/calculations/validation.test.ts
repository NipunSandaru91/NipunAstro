import {
  parseCoordinate,
  validateCalculationInput,
} from "../../lib/calculations/validation.ts";

Deno.test("accepts valid calculation input", () => {
  const result = validateCalculationInput({
    birthDate: "1991-04-06",
    birthTime: "14:12",
    timezone: "Asia/Colombo",
    latitude: 6.927079,
    longitude: 79.861244,
  });
  if (!result.ok) throw new Error(`Expected valid input, got ${result.error}`);
});

Deno.test("rejects missing required birth data", () => {
  const result = validateCalculationInput({
    birthDate: "",
    birthTime: "14:12",
    timezone: "Asia/Colombo",
    latitude: 6.927079,
    longitude: 79.861244,
  });
  if (result.ok || result.error !== "missing_birth_data") {
    throw new Error("Expected missing_birth_data");
  }
});

Deno.test("rejects non-finite coordinates", () => {
  const result = validateCalculationInput({
    birthDate: "1991-04-06",
    birthTime: "14:12",
    timezone: "Asia/Colombo",
    latitude: Number.NaN,
    longitude: 79.861244,
  });
  if (result.ok || result.error !== "missing_birth_data") {
    throw new Error("Expected missing_birth_data");
  }
});

Deno.test("rejects latitude outside the valid range", () => {
  const result = validateCalculationInput({
    birthDate: "1991-04-06",
    birthTime: "14:12",
    timezone: "Asia/Colombo",
    latitude: 90.000001,
    longitude: 79.861244,
  });
  if (result.ok || result.error !== "invalid_coordinates") {
    throw new Error("Expected invalid_coordinates");
  }
});

Deno.test("rejects longitude outside the valid range", () => {
  const result = validateCalculationInput({
    birthDate: "1991-04-06",
    birthTime: "14:12",
    timezone: "Asia/Colombo",
    latitude: 6.927079,
    longitude: -180.000001,
  });
  if (result.ok || result.error !== "invalid_coordinates") {
    throw new Error("Expected invalid_coordinates");
  }
});

Deno.test("parses a numeric coordinate from FormData", () => {
  const form = new FormData();
  form.set("latitude", "6.927079");
  if (parseCoordinate(form.get("latitude")) !== 6.927079) {
    throw new Error("Expected numeric latitude");
  }
});

Deno.test("parses empty FormData values as NaN", () => {
  const form = new FormData();
  if (!Number.isNaN(parseCoordinate(form.get("missing")))) {
    throw new Error("Expected NaN for missing coordinate");
  }
});
