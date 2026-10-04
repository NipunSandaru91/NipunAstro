function assert(value: unknown) {
  if (!value) throw Error("Assertion failed");
}
function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw Error("Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
  }
}
function assertThrows(fn: () => unknown) {
  let thrown = false;
  try { fn(); } catch { thrown = true; }
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
  for (const value of ["PERSONAL", "ADMIN", null, undefined, {}, "professional"]) {
    assert(!canViewTimeline(value));
  }
});

Deno.test("top MD/AD windows are refined by distinct topic-linked PD lords", () => {
  const result = buildLifeTimeline(input);
  assertEquals(result, buildLifeTimeline(input));
  assertEquals(result.past.length, 10);
  assertEquals(result.future.length, 10);
  const tones = new Set<string>();
  const evidence = new Set<string>();
  for (const side of ["past", "future"] as const) {
    const items = result[side];
    assert(items.length <= 10);
    assertEquals(new Set(items.map((i) => i.id)).size, items.length);
    const parents = new Map<string, number>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      tones.add(item.tone);
      evidence.add(item.evidenceStrength);
      assertEquals(item.signals, 3);
      assertEquals(item.dasha.length, 3);
      assert(!("refinement" in item));
      assert(item.interpretation.includes("ජ්‍යොතිෂමය අනුමානයක්"));
      assert(item.directionEvidence.length >= 2);
      const ad = item.dasha[1].path;
      parents.set(ad, (parents.get(ad) ?? 0) + 1);
      assert((parents.get(ad) ?? 0) <= 2);
      assert(
        side === "past"
          ? item.endAt <= input.asOf
          : item.startAt >= input.asOf && item.endAt <= result.until,
      );
      if (i) assert(items[i - 1].startAt <= item.startAt);
      assertEquals(item.dasha[1].parent_path, item.dasha[0].path);
      assertEquals(item.dasha[2].parent_path, item.dasha[1].path);
    }
  }
  assert(tones.has("SUPPORTIVE"));
  assert(tones.has("CHALLENGING"));
  assert(tones.has("MIXED"));
  assert(evidence.has("STRONG"));
  assert(evidence.has("MODERATE"));
});

Deno.test("no padding; age, period boundaries, and incomplete depth are respected", () => {
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
  assertEquals(partial.past.map((i) => i.id), buildLifeTimeline(input).past.map((i) => i.id));
  assertEquals(partial.future.map((i) => i.id), buildLifeTimeline(input).future.map((i) => i.id));
  const boundaryAt = buildLifeTimeline(input).past[4].endAt;
  const boundary = buildLifeTimeline({ ...input, asOf: boundaryAt });
  assert(boundary.past.every((i) => i.endAt <= boundaryAt));
  assertThrows(() => buildLifeTimeline({ ...input, birthAt: "bad" }));
  assertThrows(() => buildLifeTimeline({ ...input, asOf: "bad" }));
  assertThrows(() => buildLifeTimeline({ ...input, asOf: "1990-01-01" }));
  for (const lagna of [0, 13, 1.5]) {
    assertThrows(() => buildLifeTimeline({ ...input, lagna }));
  }
  assertThrows(() => buildLifeTimeline({ ...input, positions: [] }));
  assertThrows(() => buildLifeTimeline({
    ...input,
    positions: positions.map((p) => ({
      ...p,
      graha_id: p.graha_id === 9 ? 10 : p.graha_id,
    })),
  }));
  assertThrows(() => buildLifeTimeline({
    ...input,
    positions: positions.map((p) => ({ ...p, rasi_id: 13 })),
  }));
  const missingParents = buildLifeTimeline({
    ...input,
    periods: periods.filter((p) => p.level >= 3),
  });
  assertEquals(missingParents.past, []);
  assertEquals(missingParents.future, []);
});
