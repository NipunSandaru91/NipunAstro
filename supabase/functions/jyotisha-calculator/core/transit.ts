export type TransitNodeMethod = "MEAN" | "TRUE";

export type TransitPosition = {
  graha_id: number;
  longitude: number;
  longitude_speed: number;
  retrograde: boolean;
  rasi_id: number;
  degree_in_rasi: number;
};

export function normalizeNodeMethod(value: unknown): TransitNodeMethod {
  const method = String(value ?? "MEAN").trim().toUpperCase();
  if (method !== "MEAN" && method !== "TRUE") {
    throw new Error("node_method must be MEAN or TRUE");
  }
  return method;
}

export function transitRasi(longitude: number): { rasi_id: number; degree_in_rasi: number } {
  if (!Number.isFinite(longitude)) throw new Error("transit longitude must be finite");
  const normalized = ((longitude % 360) + 360) % 360;
  return {
    rasi_id: Math.floor(normalized / 30) + 1,
    degree_in_rasi: normalized % 30,
  };
}

export function buildTransitPosition(
  grahaId: number,
  longitude: number,
  longitudeSpeed: number,
): TransitPosition {
  if (!Number.isInteger(grahaId) || grahaId < 1 || grahaId > 9) {
    throw new Error("graha_id must be an integer from 1 to 9");
  }
  if (!Number.isFinite(longitudeSpeed)) {
    throw new Error("longitude_speed must be finite");
  }
  const r = transitRasi(longitude);
  return {
    graha_id: grahaId,
    longitude: ((longitude % 360) + 360) % 360,
    longitude_speed: longitudeSpeed,
    retrograde: longitudeSpeed < 0,
    ...r,
  };
}

export function ketuFromRahu(rahuLongitude: number, rahuSpeed: number): TransitPosition {
  return buildTransitPosition(9, rahuLongitude + 180, -rahuSpeed);
}
