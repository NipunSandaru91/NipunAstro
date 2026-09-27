import type {
  TransitNatalAnalysis,
  TransitTrend,
} from "./transit-analysis.ts";
import type {
  GenericEvidenceLevel,
  GenericTimingTheme,
} from "./generic-dasha.ts";

export type GenericTransitTriggerReason =
  | "EVIDENCE_HOUSE"
  | "EVIDENCE_GRAHA_TRANSIT"
  | "EVIDENCE_GRAHA_CONTACT";

export type GenericTransitTrigger = {
  transit_graha_id: number;
  natal_bhava: number;
  reason: GenericTransitTriggerReason;
  target_graha_id?: number;
  orb_degrees?: number;
  trend?: TransitTrend;
};

export type GenericTransitActivation = {
  topic: string;
  theme_code: string;
  natal_level: GenericEvidenceLevel;
  status: "TRIGGERED" | "UNTRIGGERED";
  activation_level: "NONE" | "MODERATE" | "STRONG";
  triggers: GenericTransitTrigger[];
  rule_version: "GENERIC_TRANSIT_EVIDENCE_ADAPTER_V1";
};

function uniqueTriggers(triggers: GenericTransitTrigger[]) {
  const seen = new Set<string>();
  return triggers.filter((trigger) => {
    const key = [
      trigger.transit_graha_id,
      trigger.natal_bhava,
      trigger.reason,
      trigger.target_graha_id ?? "",
    ].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function activateThemesByTransit(input: {
  themes: readonly GenericTimingTheme[];
  transitAnalysis: readonly TransitNatalAnalysis[];
}): GenericTransitActivation[] {
  return input.themes.map((theme) => {
    const raw: GenericTransitTrigger[] = [];

    for (const transit of input.transitAnalysis) {
      if (theme.evidence_houses.includes(transit.natal_bhava)) {
        raw.push({
          transit_graha_id: transit.graha_id,
          natal_bhava: transit.natal_bhava,
          reason: "EVIDENCE_HOUSE",
        });
      }

      if (theme.evidence_grahas.includes(transit.graha_id)) {
        raw.push({
          transit_graha_id: transit.graha_id,
          natal_bhava: transit.natal_bhava,
          reason: "EVIDENCE_GRAHA_TRANSIT",
        });
      }

      for (const contact of transit.interactions) {
        if (!theme.evidence_grahas.includes(contact.target_graha_id)) continue;
        raw.push({
          transit_graha_id: transit.graha_id,
          natal_bhava: transit.natal_bhava,
          target_graha_id: contact.target_graha_id,
          orb_degrees: contact.orb_degrees,
          trend: contact.trend,
          reason: "EVIDENCE_GRAHA_CONTACT",
        });
      }
    }

    const triggers = uniqueTriggers(raw);
    const independentReasons = new Set(triggers.map((trigger) => trigger.reason));
    const activationLevel =
      independentReasons.size >= 2
        ? ("STRONG" as const)
        : triggers.length
          ? ("MODERATE" as const)
          : ("NONE" as const);

    return {
      topic: theme.topic,
      theme_code: theme.code,
      natal_level: theme.level,
      status: triggers.length
        ? ("TRIGGERED" as const)
        : ("UNTRIGGERED" as const),
      activation_level: activationLevel,
      triggers,
      rule_version: "GENERIC_TRANSIT_EVIDENCE_ADAPTER_V1" as const,
    };
  });
}
