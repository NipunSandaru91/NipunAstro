/** Pure shared contract; no chart data, network, clock or random numbers. */
export type DailyInput = {
  date: string;
  timezone: string;
  latitude: number;
  longitude: number;
};
export type DailySky = {
  input: DailyInput;
  sunrise: number | null;
  sunset: number | null;
  referenceAt: number;
  sun: number;
  moon: number;
  engine: "SWISS_MOSEPH_LAHIRI_DAILY_V1";
};
export function validateDailyInput(value: unknown): DailyInput {
  if (!value || typeof value !== "object") throw Error("INVALID_DAILY_INPUT");
  const v = value as DailyInput;
  if (
    typeof v.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.date) ||
    !Number.isFinite(Date.parse(v.date)) ||
    new Date(v.date).toISOString().slice(0, 10) !== v.date ||
    v.date < "1900-01-01" || v.date > "2100-12-31" ||
    typeof v.timezone !== "string" ||
    !Number.isFinite(v.latitude) || Math.abs(v.latitude) > 90 ||
    !Number.isFinite(v.longitude) || Math.abs(v.longitude) > 180
  ) throw Error("INVALID_DAILY_INPUT");
  new Intl.DateTimeFormat("en", { timeZone: v.timezone }).format(0);
  return {
    date: v.date,
    timezone: v.timezone,
    latitude: v.latitude,
    longitude: v.longitude,
  };
}
export function localDate(ms: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ms);
  return ["year", "month", "day"].map((type) =>
    parts.find((p) => p.type === type)!.value
  ).join("-");
}
export function localNoon(date: string, timezone: string) {
  const target = Date.parse(date + "T12:00:00Z");
  let ms = target;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(ms);
    const p = (name: string) =>
      Number(parts.find((p) => p.type === name)!.value);
    ms += target -
      Date.UTC(
        p("year"),
        p("month") - 1,
        p("day"),
        p("hour"),
        p("minute"),
        p("second"),
      );
  }
  return ms;
}
const norm = (x: number) => ((x % 360) + 360) % 360;
export function panchanga(sun: number, moon: number) {
  if (!Number.isFinite(sun) || !Number.isFinite(moon)) {
    throw Error("INVALID_LONGITUDE");
  }
  const angle = norm(moon - sun), half = Math.floor(angle / 6);
  return {
    tithi: Math.floor(angle / 12) + 1,
    nakshatra: Math.floor(norm(moon) / (360 / 27)) + 1,
    yoga: Math.floor(norm(sun + moon) / (360 / 27)) + 1,
    karana: half === 0 ? 0 : half >= 57 ? half - 49 : 1 + (half - 1) % 7,
    moonRasi: Math.floor(norm(moon) / 30) + 1,
  };
}
export function rahuInterval(
  weekday: number,
  sunrise: number | null,
  sunset: number | null,
): [number, number] | null {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw Error("INVALID_WEEKDAY");
  }
  if (sunrise === null || sunset === null || sunset <= sunrise) return null;
  const duration = (sunset - sunrise) / 8,
    part = [8, 2, 7, 5, 6, 4, 3][weekday];
  return [sunrise + (part - 1) * duration, sunrise + part * duration];
}
/** Upper solar limb at a level sea horizon, standard refraction (-0.8333° centre).
 * Terrain/elevation/weather are not modeled. Swiss equatorial Sun feeds altitude.
 * Bracket at 10 minutes, then bisect to <1 second. Polar events are explicitly absent.
 */
export function solarCrossings(
  input: DailyInput,
  altitude: (ms: number) => number,
) {
  const noon = localNoon(input.date, input.timezone),
    start = noon - 18 * 3600000,
    end = noon + 18 * 3600000;
  let sunrise: number | null = null, sunset: number | null = null;
  let previous = altitude(start) + 0.8333;
  for (let at = start + 600000; at <= end; at += 600000) {
    const next = altitude(at) + 0.8333;
    if ((previous < 0 && next >= 0) || (previous >= 0 && next < 0)) {
      let low = at - 600000, high = at;
      const rising = previous < 0;
      while (high - low > 500) {
        const middle = (low + high) / 2;
        if ((altitude(middle) + 0.8333 >= 0) === rising) high = middle;
        else low = middle;
      }
      const event = Math.round((low + high) / 2);
      if (localDate(event, input.timezone) === input.date) {
        if (rising) sunrise = event;
        else sunset = event;
      }
    }
    previous = next;
  }
  return { sunrise, sunset };
}
