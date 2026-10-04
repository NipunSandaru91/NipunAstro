/// <reference lib="deno.ns" />
import {
  DEEP_DASHA_VERSION,
  generateDeepVimshottari,
} from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";

function equal(a: unknown, b: unknown) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  }
}
const input = {
  birth_at: "2000-01-01T00:00:00.000Z",
  moon_longitude_sidereal: 0,
  md_count: 9,
  depth: 5,
};

Deno.test("V2 uses actual Venus/Saturn graha IDs and all five levels", () => {
  const rows = generateDeepVimshottari(input);
  equal(rows.filter((r) => r.level === 1).map((r) => r.graha_id), [
    9,
    6,
    1,
    2,
    3,
    8,
    5,
    7,
    4,
  ]);
  equal(rows.length, 9 * (1 + 9 + 81 + 729 + 6561));
  equal([...new Set(rows.map((r) => r.calculation_version))], [
    DEEP_DASHA_VERSION,
  ]);
});

Deno.test("every parent has nine ordered contiguous children with exact boundaries", () => {
  const rows = generateDeepVimshottari(input);
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    if (row.parent_path !== null) {
      const siblings = groups.get(row.parent_path) ?? [];
      siblings.push(row);
      groups.set(row.parent_path, siblings);
    }
  }
  for (const parent of rows.filter((r) => r.level < 5)) {
    const children = groups.get(parent.path)!;
    equal(children.length, 9);
    equal(children[0].graha_id, parent.graha_id);
    equal(children[0].start_at, parent.start_at);
    equal(children[8].end_at, parent.end_at);
    for (let i = 1; i < 9; i++) {
      equal(children[i].start_at, children[i - 1].end_at);
    }
    equal(
      children.reduce((sum, r) => sum + r.duration_ms, 0),
      parent.duration_ms,
    );
  }
});

Deno.test("golden Moon retains Ketu balance and begins inside Mercury AD, not a restarted Ketu AD", () => {
  const rows = generateDeepVimshottari({
    birth_at: "1991-04-06T08:42:00.000Z",
    moon_longitude_sidereal: 252.348067345032,
    md_count: 4,
    depth: 5,
  });
  const md = rows[0];
  equal(md.graha_id, 9);
  equal(md.end_at, "1991-10-12T07:02:30.725Z");
  equal(rows.find((r) => r.parent_path === md.path)!.graha_id, 4);
  equal(rows.filter((r) => r.level === 1).map((r) => r.graha_id), [9, 6, 1, 2]);
  const byPath = new Map(rows.map((r) => [r.path, r]));
  for (const row of rows) {
    if (row.start_at < "1991-04-06T08:42:00.000Z" || row.duration_ms <= 0) {
      throw Error("invalid clipped period");
    }
    if (row.parent_path) {
      const parent = byPath.get(row.parent_path)!;
      if (row.start_at < parent.start_at || row.end_at > parent.end_at) {
        throw Error("child outside parent");
      }
    }
  }
});

Deno.test("birth clipping does not rescale deeper periods", () => {
  const full = generateDeepVimshottari({ ...input, md_count: 1 });
  const half = generateDeepVimshottari({
    ...input,
    birth_at: "2003-07-02T09:00:00.000Z",
    moon_longitude_sidereal: 360 / 54,
    md_count: 1,
  });
  const expected = full.filter((r) => r.end_at > "2003-07-02T09:00:00.000Z")
    .map((r) => ({
      ...r,
      start_at: r.start_at < "2003-07-02T09:00:00.000Z"
        ? "2003-07-02T09:00:00.000Z"
        : r.start_at,
      duration_ms: Date.parse(r.end_at) -
        Math.max(
          Date.parse(r.start_at),
          Date.parse("2003-07-02T09:00:00.000Z"),
        ),
    }));
  equal(half, expected);
});

Deno.test("V2 is deterministic, wraps longitudes, and uses half-open periods", () => {
  const a = generateDeepVimshottari({ ...input, depth: 1 });
  equal(
    a,
    generateDeepVimshottari({
      ...input,
      moon_longitude_sidereal: 360,
      depth: 1,
    }),
  );
  equal(
    a,
    generateDeepVimshottari({
      ...input,
      moon_longitude_sidereal: -360,
      depth: 1,
    }),
  );
  equal(
    generateDeepVimshottari({
      ...input,
      moon_longitude_sidereal: -1,
      depth: 1,
    }),
    generateDeepVimshottari({
      ...input,
      moon_longitude_sidereal: 359,
      depth: 1,
    }),
  );
  const boundary = a[0].end_at;
  equal(
    a.filter((r) => r.start_at <= boundary && boundary < r.end_at).map((r) =>
      r.graha_id
    ),
    [6],
  );
  equal(
    generateDeepVimshottari({
      birth_at: input.birth_at,
      moon_longitude_sidereal: 0,
    }).length,
    819,
  );
  equal(
    generateDeepVimshottari({
      ...input,
      moon_longitude_sidereal: 359.9999999999999,
      depth: 1,
    }).at(-1)!.graha_id,
    7,
  );
});

Deno.test("V2 rejects invalid dates, longitudes and unbounded generation", () => {
  for (
    const patch of [
      { birth_at: "2000-01-01" },
      { birth_at: "2000-02-30T00:00:00.000Z" },
      { birth_at: "bad" },
      { moon_longitude_sidereal: NaN },
      { moon_longitude_sidereal: 361 },
      { moon_longitude_sidereal: -361 },
      { birth_at: "0000-01-01T00:00:00.000Z" },
      { moon_longitude_sidereal: Infinity },
      { depth: 0 },
      { depth: 6 },
      { depth: 1.5 },
      { md_count: 0 },
      { md_count: 19 },
      { md_count: 1.5 },
    ]
  ) {
    let failed = false;
    try {
      generateDeepVimshottari({ ...input, ...patch });
    } catch {
      failed = true;
    }
    if (!failed) throw Error(`accepted ${JSON.stringify(patch)}`);
  }
});
