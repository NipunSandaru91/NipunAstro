export type TransitPositionInput = {
  graha_id: number;
  rasi_id: number;
  longitude_sidereal: number;
  degree_in_rasi?: number;
  is_retrograde?: boolean;
  transit_at?: string;
};

export type NatalGrahaInput = {
  graha_id: number;
  rasi_id: number;
  longitude_sidereal: number;
};

export type BhavaInput = {
  bhava_id: number;
  rasi_id: number;
  lord_graha_id: number;
};

export type TransitInteractionType =
  | "CONJUNCTION"
  | "SEVENTH"
  | "MARS_SPECIAL"
  | "JUPITER_SPECIAL"
  | "SATURN_SPECIAL";

export type TransitTrend =
  | "APPROACHING"
  | "SEPARATING"
  | "STABLE"
  | "ENTERED_CONTACT"
  | "NO_COMPARISON";

export type TransitInteraction = {
  target_graha_id: number;
  target_rasi_id: number;
  offset_house: number;
  type: TransitInteractionType;
  exact_angle_degrees: number;
  orb_degrees: number;
  trend: TransitTrend;
};

export type TransitNatalAnalysis = {
  graha_id: number;
  rasi_id: number;
  longitude_sidereal: number;
  degree_in_rasi?: number;
  is_retrograde: boolean;
  natal_bhava: number;
  natal_bhava_lord_graha_id?: number;
  ingress_since_previous_snapshot: boolean;
  previous_rasi_id?: number;
  interactions: TransitInteraction[];
  house_lord_contact: TransitInteraction | null;
};

function houseFromRasi(lagnaRasiId: number, rasiId: number) {
  return ((rasiId - lagnaRasiId + 12) % 12) + 1;
}

function houseOffset(sourceRasiId: number, targetRasiId: number) {
  return ((targetRasiId - sourceRasiId + 12) % 12) + 1;
}

function interactionType(
  transitGrahaId: number,
  offset: number,
): TransitInteractionType | null {
  if (offset === 1) return "CONJUNCTION";
  if (offset === 7) return "SEVENTH";
  if (transitGrahaId === 3 && (offset === 4 || offset === 8)) {
    return "MARS_SPECIAL";
  }
  if (transitGrahaId === 5 && (offset === 5 || offset === 9)) {
    return "JUPITER_SPECIAL";
  }
  if (transitGrahaId === 7 && (offset === 3 || offset === 10)) {
    return "SATURN_SPECIAL";
  }
  return null;
}

function exactAngle(type: TransitInteractionType, offset: number) {
  if (type === "CONJUNCTION") return 0;
  if (type === "SEVENTH") return 180;
  const angleByOffset: Record<number, number> = {
    3: 60,
    4: 90,
    5: 120,
    8: 210,
    9: 240,
    10: 270,
  };
  return angleByOffset[offset] ?? 0;
}

function orbDegrees(
  transitLongitude: number,
  natalLongitude: number,
  targetAngle: number,
) {
  const separation = ((natalLongitude - transitLongitude) % 360 + 360) % 360;
  return Math.abs(((separation - targetAngle + 540) % 360) - 180);
}

function interactionFor(
  transit: TransitPositionInput,
  natal: NatalGrahaInput,
): Omit<TransitInteraction, "trend"> | null {
  const offset = houseOffset(transit.rasi_id, natal.rasi_id);
  const type = interactionType(transit.graha_id, offset);
  if (!type) return null;
  const targetAngle = exactAngle(type, offset);
  return {
    target_graha_id: natal.graha_id,
    target_rasi_id: natal.rasi_id,
    offset_house: offset,
    type,
    exact_angle_degrees: targetAngle,
    orb_degrees: orbDegrees(
      transit.longitude_sidereal,
      natal.longitude_sidereal,
      targetAngle,
    ),
  };
}

function trendFor(
  current: Omit<TransitInteraction, "trend">,
  previousTransit: TransitPositionInput | undefined,
  natal: NatalGrahaInput,
): TransitTrend {
  if (!previousTransit) return "NO_COMPARISON";
  const previous = interactionFor(previousTransit, natal);
  if (!previous || previous.type !== current.type) return "ENTERED_CONTACT";
  const diff = current.orb_degrees - previous.orb_degrees;
  if (Math.abs(diff) < 0.01) return "STABLE";
  return diff < 0 ? "APPROACHING" : "SEPARATING";
}

export function buildTransitNatalAnalysis(input: {
  lagnaRasiId: number;
  transits: readonly TransitPositionInput[];
  natalGrahas: readonly NatalGrahaInput[];
  bhavas: readonly BhavaInput[];
  previousTransits?: readonly TransitPositionInput[];
}): TransitNatalAnalysis[] {
  const previousByGraha = new Map(
    (input.previousTransits ?? []).map((row) => [row.graha_id, row]),
  );

  return input.transits.map((transit) => {
    const natalBhava = houseFromRasi(input.lagnaRasiId, transit.rasi_id);
    const bhava = input.bhavas.find((row) => row.bhava_id === natalBhava);
    const previousTransit = previousByGraha.get(transit.graha_id);

    const interactions = input.natalGrahas.flatMap((natal) => {
      const current = interactionFor(transit, natal);
      if (!current) return [];
      return [
        {
          ...current,
          trend: trendFor(current, previousTransit, natal),
        },
      ];
    });

    const houseLordContact =
      interactions.find(
        (row) => row.target_graha_id === bhava?.lord_graha_id,
      ) ?? null;

    return {
      graha_id: transit.graha_id,
      rasi_id: transit.rasi_id,
      longitude_sidereal: transit.longitude_sidereal,
      degree_in_rasi: transit.degree_in_rasi,
      is_retrograde: Boolean(transit.is_retrograde),
      natal_bhava: natalBhava,
      natal_bhava_lord_graha_id: bhava?.lord_graha_id,
      ingress_since_previous_snapshot:
        Boolean(previousTransit) && previousTransit?.rasi_id !== transit.rasi_id,
      previous_rasi_id: previousTransit?.rasi_id,
      interactions,
      house_lord_contact: houseLordContact,
    };
  });
}
