import { strict as assert } from "node:assert";
import { calculateDailySky } from "../supabase/functions/daily-sky/astronomy.ts";
import { localDate, panchanga } from "../lib/daily/sky.ts";
const colombo = calculateDailySky({
  date: "2026-10-04",
  timezone: "Asia/Colombo",
  latitude: 6.9271,
  longitude: 79.8612,
});
assert.ok(
  Math.abs(colombo.sunrise! - Date.parse("2026-10-04T00:28:08Z")) < 60000,
);
assert.ok(
  Math.abs(colombo.sunset! - Date.parse("2026-10-04T12:30:27Z")) < 60000,
);
assert.deepEqual(panchanga(colombo.sun, colombo.moon), {
  tithi: 24,
  nakshatra: 7,
  yoga: 19,
  karana: 4,
  moonRasi: 3,
});
const kiryu = calculateDailySky({
  date: "2026-10-04",
  timezone: "Asia/Tokyo",
  latitude: 36.4055,
  longitude: 139.3307,
});
assert.equal(localDate(kiryu.sunrise!, kiryu.input.timezone), "2026-10-04");
assert.ok(
  Math.abs(kiryu.sunrise! - Date.parse("2026-10-03T20:39:54Z")) < 60000,
);
for (const date of ["2026-06-21", "2026-12-21"]) {
  const polar = calculateDailySky({
    date,
    timezone: "Europe/Oslo",
    latitude: 69.6492,
    longitude: 18.9553,
  });
  assert.equal(polar.sunrise, null);
  assert.equal(polar.sunset, null);
  assert.equal(localDate(polar.referenceAt, polar.input.timezone), date);
}
console.log(
  "PASS Swiss daily fixtures: Colombo, Kiryu, polar summer/winter; sunrise-date and Panchanga indices.",
);
