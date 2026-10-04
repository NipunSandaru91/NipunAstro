import {
  deepStrictEqual as assertEquals,
  throws as assertThrows,
} from "node:assert";
import {
  localDate,
  localNoon,
  panchanga,
  rahuInterval,
  solarCrossings,
  validateDailyInput,
} from "../../lib/daily/sky.ts";

Deno.test("daily input rejects invalid dates, zones, coordinates and out-of-range years", () => {
  const valid = {
    date: "2026-10-04",
    timezone: "Asia/Tokyo",
    latitude: 36.4,
    longitude: 139.3,
  };
  assertEquals(validateDailyInput(valid), valid);
  for (
    const patch of [
      { date: "2026-02-30" },
      { date: "x" },
      { date: "1800-01-01" },
      { date: "2200-01-01" },
      { timezone: "x" },
      { latitude: 91 },
      { latitude: NaN },
      { longitude: -181 },
      { latitude: null },
      { timezone: 3 },
    ]
  ) {
    assertThrows(() => validateDailyInput({ ...valid, ...patch }));
  }
  assertThrows(() => validateDailyInput(null));
});
Deno.test("local dates and noon respect IANA zones, DST and date line", () => {
  for (
    const timezone of [
      "Asia/Colombo",
      "Asia/Tokyo",
      "America/New_York",
      "Pacific/Kiritimati",
      "Pacific/Pago_Pago",
    ]
  ) {
    for (const date of ["2026-03-08", "2026-11-01"]) {
      assertEquals(localDate(localNoon(date, timezone), timezone), date);
    }
  }
  assertEquals(
    new Date(localNoon("2026-10-04", "Asia/Tokyo")).toISOString(),
    "2026-10-04T03:00:00.000Z",
  );
});
Deno.test("panchanga half-open angular boundaries and all 60 karanas", () => {
  assertEquals(panchanga(0, 0), {
    tithi: 1,
    nakshatra: 1,
    yoga: 1,
    karana: 0,
    moonRasi: 1,
  });
  assertEquals(panchanga(0, 180).tithi, 16);
  assertEquals(panchanga(0, 359.999).tithi, 30);
  for (let k = 0; k < 60; k++) {
    assertEquals(
      panchanga(0, k * 6 + 0.001).karana,
      k === 0 ? 0 : k >= 57 ? k - 49 : 1 + (k - 1) % 7,
    );
  }
  assertEquals(panchanga(360, 360), panchanga(0, 0));
  assertThrows(() => panchanga(NaN, 0));
});
Deno.test("rahu uses actual daylight eighths for every weekday, never fixed 90 minutes", () => {
  for (let day = 0; day < 7; day++) {
    const [a, b] = rahuInterval(day, 1000, 81000)!;
    assertEquals(b - a, 10000);
    assertEquals(a, 1000 + ([8, 2, 7, 5, 6, 4, 3][day] - 1) * 10000);
  }
  assertEquals(rahuInterval(0, null, 3), null);
  assertEquals(rahuInterval(0, 3, null), null);
  assertEquals(rahuInterval(0, 3, 2), null);
  assertThrows(() => rahuInterval(7, 0, 8));
});
Deno.test("solar scan finds only this local date, handles polar day/night", () => {
  const input = validateDailyInput({
    date: "2026-10-04",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
  });
  const noon = localNoon(input.date, input.timezone);
  const result = solarCrossings(
    input,
    (ms) => Math.cos((ms - noon) / 86400000 * 2 * Math.PI) * 50 - 0.8333,
  );
  assertEquals(Math.round((result.sunrise! - noon) / 3600000), -6);
  assertEquals(Math.round((result.sunset! - noon) / 3600000), 6);
  assertEquals(solarCrossings(input, () => 40), {
    sunrise: null,
    sunset: null,
  });
  assertEquals(solarCrossings(input, () => -40), {
    sunrise: null,
    sunset: null,
  });
});
