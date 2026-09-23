export type EphemerisBodyResult = {
  longitude: number;
  latitude?: number;
  longitudeSpeed?: number;
};

export type GrahaResult = EphemerisBodyResult & {
  graha_id: number;
  code: string;
  retrograde: boolean;
};

export const NATAL_BODIES = [
  ["SURYA", 0, 1], ["CHANDRA", 1, 2], ["BUDHA", 2, 4],
  ["SHUKRA", 3, 6], ["MANGALA", 4, 3], ["GURU", 5, 5], ["SHANI", 6, 7],
] as const;

export function mapGraha(code: string, grahaId: number, body: EphemerisBodyResult): GrahaResult {
  if (!Number.isFinite(body.longitude)) throw new Error(code + " result missing longitude");
  const speed = body.longitudeSpeed ?? 0;
  return { ...body, graha_id: grahaId, code, retrograde: speed < 0 };
}

export function mapNodes(rahu: EphemerisBodyResult): [GrahaResult, GrahaResult] {
  const speed = rahu.longitudeSpeed ?? 0;
  const ketuSpeed = -speed;
  return [
    mapGraha("RAHU", 8, rahu),
    mapGraha("KETU", 9, { longitude: rahu.longitude + 180, latitude: rahu.latitude === undefined ? undefined : -rahu.latitude, longitudeSpeed: ketuSpeed }),
  ];
}
