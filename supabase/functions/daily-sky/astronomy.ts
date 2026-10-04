import * as se from "jsr:@fusionstrings/swisseph-wasm@0.1.5/browser";
import {
  type DailyInput,
  type DailySky,
  localNoon,
  solarCrossings,
} from "../../../lib/daily/sky.ts";

function position(ms: number, body: number, flags: number) {
  const result = se.swe_calc_ut(ms / 86400000 + 2440587.5, body, flags);
  if (
    result.returnCode < 0 || !Number.isFinite(result.longitude) ||
    !Number.isFinite(result.latitude)
  ) throw Error("EPHEMERIS_FAILED");
  return result as { longitude: number; latitude: number };
}
export function calculateDailySky(input: DailyInput): DailySky {
  se.swe_set_sid_mode(1, 0, 0); // Lahiri; same Swiss/Moshier path as the natal engine.
  const rad = Math.PI / 180;
  const events = solarCrossings(input, (ms) => {
    const sun = position(ms, 0, 4 | 2048); // MOSEPH | EQUATORIAL, apparent of date
    const hour =
      (se.swe_sidtime(ms / 86400000 + 2440587.5) * 15 + input.longitude -
        sun.longitude) * rad;
    const lat = input.latitude * rad, dec = sun.latitude * rad;
    return Math.asin(
      Math.sin(lat) * Math.sin(dec) +
        Math.cos(lat) * Math.cos(dec) * Math.cos(hour),
    ) / rad;
  });
  const referenceAt = events.sunrise ?? localNoon(input.date, input.timezone);
  return {
    input,
    ...events,
    referenceAt,
    sun: position(referenceAt, 0, 4 | 65536).longitude,
    moon: position(referenceAt, 1, 4 | 65536).longitude,
    engine: "SWISS_MOSEPH_LAHIRI_DAILY_V1",
  };
}
