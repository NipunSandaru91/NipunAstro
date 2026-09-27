export type GenericEvidenceLevel = "WEAK" | "MODERATE" | "STRONG";

export type GenericTimingTheme = {
  topic: string;
  code: string;
  level: GenericEvidenceLevel;
  evidence_grahas: readonly number[];
  evidence_houses: readonly number[];
};

export type GenericDashaActivation = {
  topic: string;
  theme_code: string;
  natal_level: GenericEvidenceLevel;
  status: "ACTIVE" | "DORMANT";
  activation_level: "NONE" | "MODERATE" | "STRONG";
  mahadasa_graha_id: number;
  antardasa_graha_id: number;
  matched_lords: number[];
  rule_version: "GENERIC_DASHA_ACTIVATION_V1";
};

export function activateThemesByDasha(input: {
  themes: readonly GenericTimingTheme[];
  mahadasaGrahaId: number;
  antardasaGrahaId: number;
}): GenericDashaActivation[] {
  return input.themes.map((theme) => {
    const matched = [
      input.mahadasaGrahaId,
      input.antardasaGrahaId,
    ].filter(
      (id, index, all) =>
        theme.evidence_grahas.includes(id) && all.indexOf(id) === index,
    );

    return {
      topic: theme.topic,
      theme_code: theme.code,
      natal_level: theme.level,
      status: matched.length ? ("ACTIVE" as const) : ("DORMANT" as const),
      activation_level:
        matched.length >= 2
          ? ("STRONG" as const)
          : matched.length === 1
            ? ("MODERATE" as const)
            : ("NONE" as const),
      mahadasa_graha_id: input.mahadasaGrahaId,
      antardasa_graha_id: input.antardasaGrahaId,
      matched_lords: matched,
      rule_version: "GENERIC_DASHA_ACTIVATION_V1" as const,
    };
  });
}
