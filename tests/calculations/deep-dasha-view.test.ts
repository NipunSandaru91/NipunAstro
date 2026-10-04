/// <reference lib="deno.ns" />
import { generateDeepVimshottari } from "../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts";
import {
  buildDeepDashaView,
  predictionDashaRows,
  savedDeepDashaInput,
} from "../../lib/calculations/deep-dasha-view.ts";
const rows = generateDeepVimshottari({
  birth_at: "2000-01-01T00:00:00.000Z",
  moon_longitude_sidereal: 0,
  md_count: 2,
  depth: 5,
});
function equal(a: unknown, b: unknown) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`);
  }
}
Deno.test("deep view reveals one child level and retains the current five-lord chain", () => {
  const root = buildDeepDashaView(
    rows,
    undefined,
    Date.parse(rows[0].start_at),
  );
  equal(root.children.length, 2);
  equal(root.current.map((r) => r.graha_id), [9, 9, 9, 9, 9]);
  equal(root.ancestors, []);
  equal(root.focus, null);
  const ad = buildDeepDashaView(rows, "1.2", Date.parse(rows[0].start_at));
  equal(ad.focus!.graha_id, 6);
  equal(ad.children.length, 9);
  equal(ad.children.every((r) => r.level === 3), true);
  equal(ad.ancestors.map((r) => r.path), ["1", "1.2"]);
  equal(buildDeepDashaView(rows, "1.2.1.1.1", 0).children, []);
  equal(buildDeepDashaView(rows, undefined, 0).current, []);
});
Deno.test("deep view rejects malformed or nonexistent paths and dates", () => {
  for (const path of ["1.foo", "0", "1.1.1.1.1.1", "999", "3", "<script>", "1.10"]) {
    let rejected = false;
    try {
      buildDeepDashaView(rows, path, 0);
    } catch {
      rejected = true;
    }
    if (!rejected) throw Error("bad path accepted");
  }
  let rejected = false;
  try {
    buildDeepDashaView(rows, undefined, NaN);
  } catch {
    rejected = true;
  }
  if (!rejected) throw Error("bad clock");
});
Deno.test("V2 prediction adapter preserves MD/AD parent identity and half-open boundaries", () => {
  const { md, ad } = predictionDashaRows("chart-a", rows);
  equal(md.length, 2);
  equal(ad.length, 18);
  equal(md[1].graha_id, 6);
  equal(ad.filter((r) => r.mahadasa_id === md[1].id).length, 9);
  equal(ad[0].start_at, md[0].start_at);
  equal(ad[8].end_at, md[0].end_at);
  equal(predictionDashaRows("chart-b", rows).md[0].id === md[0].id, false);
});
Deno.test("saved input uses canonical UTC and never coerces missing Moon to zero", () => {
  equal(
    savedDeepDashaInput(
      { status: "CALCULATED", utc_timestamp: "1991-04-06T08:42:00+00:00" },
      { longitude_sidereal: "252.348067345032" },
      2,
    ),
    {
      birth_at: "1991-04-06T08:42:00.000Z",
      moon_longitude_sidereal: 252.348067345032,
      md_count: 18,
      depth: 2,
    },
  );
  for (
    const [run, moon] of [
      [null, null],
      [{ status: "PENDING", utc_timestamp: "2000-01-01" }, null],
      [{ status: "CALCULATED", utc_timestamp: null }, {
        longitude_sidereal: 0,
      }],
      [{ status: "CALCULATED", utc_timestamp: "bad" }, {
        longitude_sidereal: 0,
      }],
      [{ status: "CALCULATED", utc_timestamp: "2000-01-01" }, null],
      [{ status: "CALCULATED", utc_timestamp: "2000-01-01" }, {
        longitude_sidereal: null,
      }],
      [{ status: "CALCULATED", utc_timestamp: "2000-01-01" }, {
        longitude_sidereal: "",
      }],
    ] as const
  ) {
    equal(savedDeepDashaInput(run, moon, 2), null);
  }
});
