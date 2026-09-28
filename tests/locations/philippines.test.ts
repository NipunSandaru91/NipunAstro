/// <reference lib="deno.ns" />
import {
  PHILIPPINES_CITIES_BY_REGION,
  PHILIPPINES_CITY_COUNT,
  PHILIPPINES_REGIONS,
} from "../../lib/locations/philippines.ts";

Deno.test("Philippines PSGC city coverage stays complete", () => {
  if (PHILIPPINES_REGIONS.length !== 18) {
    throw new Error(`expected 18 PSGC regions, got ${PHILIPPINES_REGIONS.length}`);
  }
  if (PHILIPPINES_CITY_COUNT !== 149) {
    throw new Error(`expected 149 PSGC cities, got ${PHILIPPINES_CITY_COUNT}`);
  }

  const required = [
    ["Region III (Central Luzon)", "Baliwag"],
    ["Region IV-A (CALABARZON)", "Calaca"],
    ["Region IV-A (CALABARZON)", "Carmona"],
    ["Region IV-A (CALABARZON)", "Trece Martires"],
    ["Negros Island Region (NIR)", "Silay"],
  ] as const;

  for (const [region, city] of required) {
    if (!PHILIPPINES_CITIES_BY_REGION[region]?.includes(city)) {
      throw new Error(`missing official city: ${city} in ${region}`);
    }
  }
});
