/// <reference lib="deno.ns" />

import {
  asc1,
  asc2,
  atand,
  cosd,
  dms,
  mcFromArmc,
  norm,
  rasi,
  sind,
  tand,
} from "../../supabase/functions/jyotisha-calculator/core/math.ts";
import { allVargaPositions } from "../../supabase/functions/jyotisha-calculator/core/vargas.ts";

function assertClose(actual: number, expected: number, tolerance = 1e-9) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

Deno.test("normalizes angles into [0, 360)", () => {
  if (norm(0) !== 0 || norm(360) !== 0 || norm(-10) !== 350) {
    throw new Error("Angle normalization failed");
  }
});

Deno.test("converts decimal degrees to DMS", () => {
  const value = dms(30.5);
  if (value.degrees !== 30 || value.minutes !== 30 || value.seconds !== 0) {
    throw new Error("DMS conversion failed");
  }
});

Deno.test("maps longitude to rasi", () => {
  const value = rasi(359.5);
  if (value.number !== 12 || value.degree !== 29.5) {
    throw new Error("Rasi conversion failed");
  }
});

Deno.test("provides degree trigonometry helpers", () => {
  assertClose(sind(30), 0.5);
  assertClose(cosd(60), 0.5);
  assertClose(tand(45), 1);
  assertClose(atand(1), 45);
});

Deno.test("handles asc2 singular trigonometric branches", () => {
  const regular = asc2(45, 10, sind(23.4), cosd(23.4));
  if (!Number.isFinite(regular)) throw new Error("Expected finite asc2 result");

  const zeroSine = asc2(0, 10, 0, 1);
  if (!Number.isFinite(zeroSine)) throw new Error("Expected finite zero-sine result");

  const positiveNinety = asc2(90, 0, 0, 1);
  if (!Number.isFinite(positiveNinety)) throw new Error("Expected finite positive ninety result");

  const negativeNinety = asc2(270, 0, 0, 1);
  if (!Number.isFinite(negativeNinety)) throw new Error("Expected finite negative ninety result");

  const zeroDenominator = asc2(90, 90, 1, 0);
  if (!Number.isFinite(zeroDenominator)) throw new Error("Expected finite zero-denominator result");
});

Deno.test("handles asc1 polar limits and all quadrants", () => {
  const sine = sind(23.4);
  const cosine = cosd(23.4);

  if (asc1(10, 90, sine, cosine) !== 180) throw new Error("North polar limit failed");
  if (asc1(10, -90, sine, cosine) !== 0) throw new Error("South polar limit failed");

  for (const x of [45, 135, 225, 315]) {
    if (!Number.isFinite(asc1(x, 10, sine, cosine))) {
      throw new Error(`Quadrant calculation failed for ${x}`);
    }
  }
});

Deno.test("calculates MC in regular and cardinal cases", () => {
  for (const armc of [0, 100, 200, 280]) {
    if (!Number.isFinite(mcFromArmc(armc, 23.4))) {
      throw new Error(`MC calculation failed for ${armc}`);
    }
  }
  if (mcFromArmc(90, 23.4) !== 90) throw new Error("MC 90-degree branch failed");
  if (mcFromArmc(270, 23.4) !== 270) throw new Error("MC 270-degree branch failed");
});

Deno.test("calculates all 15 classical vargas for representative longitudes", () => {
  for (const longitude of [0, 14.999999, 15, 29.999999, 30, 59.999999, 90, 150, 210, 270, 330, 359.999999]) {
    const positions = allVargaPositions(longitude);
    if (positions.length !== 15) {
      throw new Error(`Expected 15 vargas, got ${positions.length}`);
    }
    const ids = positions.map((position) => position.varga_id);
    if (ids.join(",") !== "2,3,4,5,6,7,8,9,10,11,12,13,14,15,16") {
      throw new Error("Unexpected varga id sequence");
    }
    for (const position of positions) {
      if (position.source_rasi_id < 1 || position.source_rasi_id > 12) {
        throw new Error("Invalid source rasi");
      }
      if (position.varga_rasi_id < 1 || position.varga_rasi_id > 12) {
        throw new Error("Invalid varga rasi");
      }
      if (position.division_index < 1) {
        throw new Error("Invalid division index");
      }
      if (position.rule_version !== "CLASSICAL_TDD_V1") {
        throw new Error("Unexpected rule version");
      }
    }
  }
});

Deno.test("covers D30 odd and even segment maps", () => {
  const odd = allVargaPositions(12);
  const even = allVargaPositions(42);
  const oddD30 = odd.find((position) => position.varga_id === 13);
  const evenD30 = even.find((position) => position.varga_id === 13);
  if (!oddD30 || !evenD30) throw new Error("D30 position missing");
  if (oddD30.varga_rasi_id !== 9) throw new Error("Unexpected odd D30 mapping");
  if (evenD30.varga_rasi_id !== 12) throw new Error("Unexpected even D30 mapping");
});

Deno.test("covers D27, D16, D20 and D45 modulo branches", () => {
  for (const sourceRasi of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const longitude = (sourceRasi - 1) * 30 + 1;
    const positions = allVargaPositions(longitude);
    for (const id of [9, 10, 12, 15]) {
      const position = positions.find((item) => item.varga_id === id);
      if (!position) throw new Error(`Missing D${id === 9 ? 16 : id === 10 ? 20 : id === 12 ? 27 : 45}`);
    }
  }
});

Deno.test("covers D60 boundary normalization", () => {
  const before = allVargaPositions(59.499999);
  const boundary = allVargaPositions(59.5);
  const beforeD60 = before.find((position) => position.varga_id === 16)!;
  const boundaryD60 = boundary.find((position) => position.varga_id === 16)!;

  if (beforeD60.division_index !== 59) throw new Error("Unexpected D60 division before boundary");
  if (boundaryD60.division_index !== 60) throw new Error("Unexpected D60 division at boundary");
});
