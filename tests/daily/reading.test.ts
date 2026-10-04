import { deepStrictEqual as eq, ok, throws } from "node:assert";
import { buildDailyReading, dailySymbols } from "../../lib/daily/reading.ts";
import { generateDeepVimshottari } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
const periods = generateDeepVimshottari({
  birth_at: "1991-04-06T08:42:00.000Z",
  moon_longitude_sidereal: 252.35,
  md_count: 18,
  depth: 2,
});
Deno.test("daily reading deterministic, chart-sensitive and covers all houses and timing states", () => {
  const input = {
    lagna: 4,
    positions: [
      { graha_id: 1, rasi_id: 9 },
      { graha_id: 2, rasi_id: 6 },
      { graha_id: 3, rasi_id: 12 },
      { graha_id: 4, rasi_id: 10 },
      { graha_id: 5, rasi_id: 1 },
      { graha_id: 6, rasi_id: 10 },
      { graha_id: 7, rasi_id: 7 },
      { graha_id: 8, rasi_id: 7 },
      { graha_id: 9, rasi_id: 1 },
    ],
    moonRasi: 4,
    at: Date.parse("2026-10-04T00:00Z"),
    periods,
  };
  eq(buildDailyReading(input), buildDailyReading(input));
  for (let lagna = 1; lagna <= 12; lagna++) {
    for (let moonRasi = 1; moonRasi <= 12; moonRasi++) {
      const r = buildDailyReading({ ...input, lagna, moonRasi });
      eq(r.topics.length, 3);
      ok(r.focus.length > 10);
      ok(r.summary.includes(String(r.moonHouse)));
      for (let weekday = 0; weekday < 7; weekday++) {
        ok(
          dailySymbols(weekday, lagna).numbers.every((n) => n >= 1 && n <= 9),
        );
      }
    }
  }
  eq(buildDailyReading({ ...input, periods: [] }).timing, "දශා දත්ත සම්පූර්ණ නැහැ");
  buildDailyReading({ ...input, positions: [] });
  for (const p of periods.filter((p) => p.level === 2)) {
    buildDailyReading({ ...input, at: Date.parse(p.start_at) });
  }
  for (
    const patch of [{ lagna: 0 }, { lagna: 13 }, { moonRasi: 0 }, {
      moonRasi: 13,
    }, { at: NaN }]
  ) throws(() => buildDailyReading({ ...input, ...patch }));
  for (const args of [[-1, 1], [7, 1], [0, 0], [0, 13], [0.5, 1], [0, 1.5]]) {
    throws(() => dailySymbols(args[0], args[1]));
  }
});
