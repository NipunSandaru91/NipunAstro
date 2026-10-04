function assert(value: unknown) {
  if (!value) throw Error("Assertion failed");
}
function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw Error(
      `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
function assertThrows(fn: () => unknown) {
  let thrown = false;
  try {
    fn();
  } catch {
    thrown = true;
  }
  assert(thrown);
}
import {
  buildLifeTimeline,
  canViewTimeline,
} from "../../lib/timeline/life-timeline.ts";
import { generateDeepVimshottari } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
const birthAt = "1991-04-06T08:42:00.000Z";
const positions = [12, 9, 3, 1, 4, 1, 10, 10, 4].map((rasi_id, i) => ({
  graha_id: i + 1,
  rasi_id,
}));
const periods = generateDeepVimshottari({
  birth_at: birthAt,
  moon_longitude_sidereal: 252.348067345,
  depth: 5,
  md_count: 18,
});
const input = {
  lagna: 4,
  positions,
  birthAt,
  asOf: "2026-10-04T13:00:00.000Z",
  periods,
};
Deno.test("Professional-only policy is fail-closed", () => {
  assert(canViewTimeline("PROFESSIONAL"));
  for (
    const value of ["PERSONAL", "ADMIN", null, undefined, {}, "professional"]
  ) assert(!canViewTimeline(value));
});
Deno.test("golden timeline is deterministic, chronological, distinct, nested and capped", () => {
  const result = buildLifeTimeline(input);
  assertEquals(result, buildLifeTimeline(input));
  assertEquals(result.past.length, 10);
  assertEquals(result.future.length, 9);
  assertEquals(result.ongoing.length, 1);
  for (const side of ["past", "future"] as const) {
    const items = result[side];
    assertEquals(new Set(items.map((i) => i.dasha[2].path)).size, items.length);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      assert(item.signals >= 2);
      assertEquals(item.refinement.length, 2);
      assert(
        side === "past"
          ? item.endAt <= input.asOf
          : item.startAt >= input.asOf && item.endAt <= result.until,
      );
      if (i) assert(items[i - 1].startAt <= item.startAt);
      const chain = [...item.dasha, ...item.refinement];
      for (let j = 1; j < 5; j++) {
        assert(chain[j].start_at >= chain[j - 1].start_at);
        assert(chain[j].end_at <= chain[j - 1].end_at);
      }
    }
  }
});
Deno.test("missing data never pads a timeline and birth/current boundaries are respected", () => {
  assertEquals(buildLifeTimeline({ ...input, periods: [] }).past, []);
  const newborn = buildLifeTimeline({ ...input, asOf: birthAt });
  assertEquals(newborn.past, []);
  assert(
    newborn.future.every((i) =>
      ["learning", "relationships", "home"].includes(i.topic)
    ),
  );
  const partial = buildLifeTimeline({
    ...input,
    periods: periods.filter((p) => p.level <= 3),
  });
  assert(partial.past.every((i) => i.refinement.length === 0));
  const boundary = buildLifeTimeline({ ...input, asOf: resultEnd() });
  assert(boundary.past.some((i) => i.endAt <= resultEnd()));
  assertThrows(() => buildLifeTimeline({ ...input, birthAt: "bad" }));
  assertThrows(() => buildLifeTimeline({ ...input, asOf: "bad" }));
  assertThrows(() => buildLifeTimeline({ ...input, asOf: "1990-01-01" }));
  for (const lagna of [0, 13, 1.5]) {
    assertThrows(() => buildLifeTimeline({ ...input, lagna }));
  }
  assertThrows(() => buildLifeTimeline({ ...input, positions: [] }));
  assertThrows(() =>
    buildLifeTimeline({
      ...input,
      positions: positions.map((p) => ({
        ...p,
        graha_id: p.graha_id === 9 ? 10 : p.graha_id,
      })),
    })
  );
  assertThrows(() =>
    buildLifeTimeline({
      ...input,
      positions: positions.map((p) => ({ ...p, rasi_id: 13 })),
    })
  );
  assertThrows(() =>
    buildLifeTimeline({
      ...input,
      periods: periods.filter((p) => p.level >= 3),
    })
  );
});
function resultEnd() {
  return buildLifeTimeline(input).past[4].endAt;
}
