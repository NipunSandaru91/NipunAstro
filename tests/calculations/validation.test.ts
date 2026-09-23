/// <reference lib="deno.ns" />

import {
  parseCoordinate,
  validateCalculationInput,
} from "../../lib/calculations/validation.ts";

const validInput = {
  birthDate: "1991-04-06",
  birthTime: "14:12",
  timezone: "Asia/Colombo",
  latitude: 6.927079,
  longitude: 79.861244,
};

Deno.test("accepts valid calculation input", () => {
  const result = validateCalculationInput(validInput);
  if (!result.ok) throw new Error(`Expected valid input, got ${result.error}`);
});

Deno.test("rejects missing birth date", () => {
  const result = validateCalculationInput({ ...validInput, birthDate: "" });
  if (result.ok || result.error !== "missing_birth_data") {
    throw new Error("Expected missing_birth_data");
  }
});

Deno.test("rejects missing birth time", () => {
  const result = validateCalculationInput({ ...validInput, birthTime: "" });
  if (result.ok || result.error !== "missing_birth_data") {
    throw new Error("Expected missing_birth_data");
  }
});

Deno.test("rejects missing timezone", () => {
  const result = validateCalculationInput({ ...validInput, timezone: "" });
  if (result.ok || result.error !== "missing_birth_data") {
    throw new Error("Expected missing_birth_data");
  }
});

Deno.test("rejects non-finite latitude", () => {
  const result = validateCalculationInput({
    ...validInput,
    latitude: Number.NaN,
  });
  if (result.ok || result.error !== "invalid_coordinates") {
    throw new Error("Expected invalid_coordinates");
  }
});

Deno.test("rejects non-finite longitude", () => {
  const result = validateCalculationInput({
    ...validInput,
    longitude: Number.POSITIVE_INFINITY,
  });
  if (result.ok || result.error !== "invalid_coordinates") {
    throw new Error("Expected invalid_coordinates");
  }
});

Deno.test("accepts coordinates outside range because range validation is delegated", () => {
  const result = validateCalculationInput({
    ...validInput,
    latitude: 91,
    longitude: 181,
  });
  if (!result.ok) throw new Error(`Expected valid finite coordinates, got ${result.error}`);
});

Deno.test("parses a numeric coordinate from FormData", () => {
  const form = new FormData();
  form.set("latitude", "6.927079");
  if (parseCoordinate(form.get("latitude")) !== 6.927079) {
    throw new Error("Expected numeric latitude");
  }
});

Deno.test("parses an absent coordinate as zero, matching Number conversion semantics", () => {
  const form = new FormData();
  if (parseCoordinate(form.get("missing")) !== 0) {
    throw new Error("Expected zero for missing coordinate");
  }
});
