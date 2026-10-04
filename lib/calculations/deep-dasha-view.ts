import {
  DEEP_DASHA_VERSION,
  type DeepDashaInput,
  type DeepDashaPeriod,
} from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";

/** Missing canonical inputs mean unavailable timing, never a made-up zero longitude. */
export function savedDeepDashaInput(
  run: { status?: unknown; utc_timestamp?: unknown } | null,
  moon: { longitude_sidereal?: unknown } | null,
  depth: number,
): DeepDashaInput | null {
  if (
    run?.status !== "CALCULATED" || typeof run.utc_timestamp !== "string" ||
    moon?.longitude_sidereal === null ||
    moon?.longitude_sidereal === undefined || moon.longitude_sidereal === ""
  ) return null;
  const birth = Date.parse(run.utc_timestamp),
    longitude = Number(moon.longitude_sidereal);
  if (
    !Number.isFinite(birth) || !Number.isFinite(longitude) || longitude < 0 ||
    longitude >= 360
  ) return null;
  return {
    birth_at: new Date(birth).toISOString(),
    moon_longitude_sidereal: longitude,
    md_count: 18,
    depth,
  };
}

export function buildDeepDashaView(
  rows: readonly DeepDashaPeriod[],
  path: string | undefined,
  now: number,
) {
  if (!Number.isFinite(now)) throw Error("INVALID_DASHA_CLOCK");
  if (path !== undefined && !/^[1-9]\d?(\.[1-9]){0,4}$/.test(path)) {
    throw Error("INVALID_DASHA_PATH");
  }
  const focus = path === undefined
    ? null
    : rows.find((row) => row.path === path);
  if (focus === undefined) throw Error("DASHA_PERIOD_NOT_FOUND");
  const parts = path?.split(".") ?? [];
  const ancestors = parts.map((_, i) =>
    rows.find((row) => row.path === parts.slice(0, i + 1).join("."))!
  );
  return {
    focus,
    ancestors,
    children: rows.filter((row) => row.parent_path === (path ?? null)),
    current: rows.filter((row) =>
      Date.parse(row.start_at) <= now && now < Date.parse(row.end_at)
    ),
  };
}

/** Compatibility shape for existing interpretation rules; no legacy period is read. */
export function predictionDashaRows(
  calculationId: string,
  rows: readonly DeepDashaPeriod[],
) {
  const key = (path: string) =>
    `${calculationId}:${DEEP_DASHA_VERSION}:${path}`;
  const md = rows.filter((row) => row.level === 1).map((row) => ({
    id: key(row.path),
    graha_id: row.graha_id,
    start_at: row.start_at,
    end_at: row.end_at,
  }));
  const ad = rows.filter((row) => row.level === 2).map((row) => ({
    id: key(row.path),
    mahadasa_id: key(row.parent_path!),
    graha_id: row.graha_id,
    start_at: row.start_at,
    end_at: row.end_at,
  }));
  return { md, ad };
}
