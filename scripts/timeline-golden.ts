import { generateDeepVimshottari } from "../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
import { buildLifeTimeline } from "../lib/timeline/life-timeline.ts";
const birthAt = "1991-04-06T08:42:00.000Z";
const result = buildLifeTimeline({
  lagna: 4,
  positions: [12, 9, 3, 1, 4, 1, 10, 10, 4].map((rasi_id, i) => ({
    graha_id: i + 1,
    rasi_id,
  })),
  birthAt,
  asOf: "2026-10-04T13:00:00.000Z",
  periods: generateDeepVimshottari({
    birth_at: birthAt,
    moon_longitude_sidereal: 252.348067345,
    depth: 5,
    md_count: 18,
  }),
});
console.log(JSON.stringify(result, null, 2));
