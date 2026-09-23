export type CalculationInput = {
  birthDate: string;
  birthTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: "missing_birth_data" | "invalid_coordinates" };

export function validateCalculationInput(input: CalculationInput): ValidationResult {
  if (
    !input.birthDate ||
    !input.birthTime ||
    !input.timezone ||
    !Number.isFinite(input.latitude) ||
    !Number.isFinite(input.longitude)
  ) {
    return { ok: false, error: "missing_birth_data" };
  }

  if (
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return { ok: false, error: "invalid_coordinates" };
  }

  return { ok: true };
}

export function parseCoordinate(value: FormDataEntryValue | null): number {
  return Number(String(value ?? "").trim());
}
