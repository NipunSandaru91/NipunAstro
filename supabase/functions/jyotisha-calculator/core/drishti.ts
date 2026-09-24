export type GrahaAspect = {
  source_graha_id: number;
  source_rasi_id: number;
  house_offset: number;
  target_rasi_id: number;
  target_bhava_number: number;
  aspect_type: "FULL";
  strength_fraction: number;
  is_special: boolean;
  rule_version: "PARASHARI_GRAHA_DRISHTI_V1";
};

const OFFSETS: Record<number, number[]> = {
  1: [7],
  2: [7],
  3: [4, 7, 8],
  4: [7],
  5: [5, 7, 9],
  6: [7],
  7: [3, 7, 10],
  8: [7],
  9: [7],
};

function assertGraha(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 9) {
    throw new Error("graha_id must be an integer from 1 to 9");
  }
}

function assertHouse(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    throw new Error("house number must be an integer from 1 to 12");
  }
}

export function grahaAspectOffsets(grahaId: number): number[] {
  assertGraha(grahaId);
  return [...OFFSETS[grahaId]];
}

export function aspectTargetRasi(sourceRasiId: number, houseOffset: number): number {
  if (!Number.isInteger(sourceRasiId) || sourceRasiId < 1 || sourceRasiId > 12) {
    throw new Error("source rasi_id must be an integer from 1 to 12");
  }
  assertHouse(houseOffset);
  return ((sourceRasiId - 1 + houseOffset - 1) % 12) + 1;
}

export function grahaAspects(
  sourceGrahaId: number,
  sourceRasiId: number,
  lagnaRasiId: number,
): GrahaAspect[] {
  assertGraha(sourceGrahaId);
  if (!Number.isInteger(sourceRasiId) || sourceRasiId < 1 || sourceRasiId > 12) {
    throw new Error("source rasi_id must be an integer from 1 to 12");
  }
  if (!Number.isInteger(lagnaRasiId) || lagnaRasiId < 1 || lagnaRasiId > 12) {
    throw new Error("lagna rasi_id must be an integer from 1 to 12");
  }

  return grahaAspectOffsets(sourceGrahaId).map((house_offset) => {
    const target_rasi_id = aspectTargetRasi(sourceRasiId, house_offset);
    const target_bhava_number =
      ((target_rasi_id - lagnaRasiId + 12) % 12) + 1;

    return {
      source_graha_id: sourceGrahaId,
      source_rasi_id: sourceRasiId,
      house_offset,
      target_rasi_id,
      target_bhava_number,
      aspect_type: "FULL",
      strength_fraction: 1,
      is_special: house_offset !== 7,
      rule_version: "PARASHARI_GRAHA_DRISHTI_V1",
    };
  });
}

export function allGrahaAspects(
  positions: Array<{ graha_id: number; rasi_id: number }>,
  lagnaRasiId: number,
): GrahaAspect[] {
  return positions.flatMap((position) =>
    grahaAspects(position.graha_id, position.rasi_id, lagnaRasiId)
  );
}
