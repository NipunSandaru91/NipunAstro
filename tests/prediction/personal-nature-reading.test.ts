import { assert, assertStringIncludes } from "jsr:@std/assert@1";
import { buildPersonalNatureReading } from "../../lib/prediction/ui/personal-nature-reading.ts";

Deno.test("personal nature reading binds Lagna lord and Moon to each chart", () => {
  const nipun = buildPersonalNatureReading({
    lagnaRasiId: 4,
    positions: [
      { graha_id: 1, rasi_id: 12 }, { graha_id: 2, rasi_id: 9 },
      { graha_id: 5, rasi_id: 4 },
    ],
  });
  const nisith = buildPersonalNatureReading({
    lagnaRasiId: 9,
    positions: [
      { graha_id: 1, rasi_id: 7 }, { graha_id: 2, rasi_id: 5 },
      { graha_id: 5, rasi_id: 8 },
    ],
  });

  assertStringIncludes(nipun.lagnaLabel, "කටක");
  assertStringIncludes(nipun.overview, "චන්ද්‍ර");
  assertStringIncludes(nisith.lagnaLabel, "ධනු");
  assertStringIncludes(nisith.overview, "ගුරු");
  assert(nipun.overview !== nisith.overview);
  assert(nipun.emotionalPattern !== nisith.emotionalPattern);
});

Deno.test("personal nature reading refuses charts missing a Lagna lord", () => {
  let thrown: unknown;
  try {
    buildPersonalNatureReading({ lagnaRasiId: 1, positions: [{ graha_id: 2, rasi_id: 9 }] });
  } catch (error) {
    thrown = error;
  }
  assertStringIncludes(String(thrown), "LAGNA_LORD_POSITION_MISSING");
});

Deno.test("personal nature reading refuses charts missing the Moon", () => {
  let thrown: unknown;
  try {
    buildPersonalNatureReading({ lagnaRasiId: 1, positions: [{ graha_id: 3, rasi_id: 1 }] });
  } catch (error) {
    thrown = error;
  }
  assertStringIncludes(String(thrown), "MOON_POSITION_MISSING");
});
