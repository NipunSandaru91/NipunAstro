export type Bhava = {
  bhava: number;
  rasi_id: number;
  lord_graha_id: number;
};

const RASI_LORD_GRAHA: Record<number, number> = {
  1: 3,
  2: 6,
  3: 4,
  4: 2,
  5: 1,
  6: 4,
  7: 6,
  8: 3,
  9: 5,
  10: 7,
  11: 7,
  12: 5,
};

function assertRasi(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    throw new Error("rasi_id must be an integer from 1 to 12");
  }
}

export function houseFromRasi(lagnaRasiId: number, planetRasiId: number): number {
  assertRasi(lagnaRasiId);
  assertRasi(planetRasiId);
  return ((planetRasiId - lagnaRasiId + 12) % 12) + 1;
}

export function bhavaRasiId(lagnaRasiId: number, bhava: number): number {
  assertRasi(lagnaRasiId);
  if (!Number.isInteger(bhava) || bhava < 1 || bhava > 12) {
    throw new Error("bhava must be an integer from 1 to 12");
  }
  return ((lagnaRasiId - 1 + bhava - 1) % 12) + 1;
}

export function bhavaLordGrahaId(rasiId: number): number {
  assertRasi(rasiId);
  return RASI_LORD_GRAHA[rasiId];
}

export function allBhavas(lagnaRasiId: number): Bhava[] {
  assertRasi(lagnaRasiId);
  return Array.from({ length: 12 }, (_, index) => {
    const bhava = index + 1;
    const rasi_id = bhavaRasiId(lagnaRasiId, bhava);
    return {
      bhava,
      rasi_id,
      lord_graha_id: bhavaLordGrahaId(rasi_id),
    };
  });
}
