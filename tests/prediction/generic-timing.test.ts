/// <reference lib="deno.ns" />
import { activateThemesByDasha } from "../../lib/prediction/timing/generic-dasha.ts";
import { activateThemesByTransit } from "../../lib/prediction/timing/generic-transit.ts";
import {
  combineGenericTiming,
  timingStatusSi,
} from "../../lib/prediction/timing/generic-timing.ts";
import type { TransitNatalAnalysis } from "../../lib/prediction/timing/transit-analysis.ts";

const theme = {
  topic: "CAREER",
  code: "X",
  level: "STRONG" as const,
  evidence_grahas: [3, 4],
  evidence_houses: [10, 12],
};

const contact = {
  target_graha_id: 3,
  target_rasi_id: 3,
  offset_house: 7,
  type: "SEVENTH" as const,
  exact_angle_degrees: 180,
  orb_degrees: 1.25,
  trend: "APPROACHING" as const,
};

const transitAnalysis: TransitNatalAnalysis[] = [
  {
    graha_id: 5,
    rasi_id: 1,
    longitude_sidereal: 12,
    degree_in_rasi: 12,
    is_retrograde: false,
    natal_bhava: 10,
    natal_bhava_lord_graha_id: 3,
    ingress_since_previous_snapshot: false,
    interactions: [contact, { ...contact }],
    house_lord_contact: contact,
  },
  {
    graha_id: 4,
    rasi_id: 5,
    longitude_sidereal: 123,
    degree_in_rasi: 3,
    is_retrograde: false,
    natal_bhava: 2,
    natal_bhava_lord_graha_id: 1,
    ingress_since_previous_snapshot: false,
    interactions: [],
    house_lord_contact: null,
  },
];

Deno.test("generic Dasha adapter preserves natal promise and traces active lords", () => {
  const moderate = activateThemesByDasha({
    themes: [theme],
    mahadasaGrahaId: 3,
    antardasaGrahaId: 5,
  })[0];
  if (moderate.status !== "ACTIVE" || moderate.activation_level !== "MODERATE") {
    throw new Error("single Dasha evidence lord should be moderate");
  }

  const strong = activateThemesByDasha({
    themes: [theme],
    mahadasaGrahaId: 3,
    antardasaGrahaId: 4,
  })[0];
  if (strong.activation_level !== "STRONG" || strong.matched_lords.length !== 2) {
    throw new Error("Mahadasha/Antardasha convergence missing");
  }

  const duplicate = activateThemesByDasha({
    themes: [theme],
    mahadasaGrahaId: 3,
    antardasaGrahaId: 3,
  })[0];
  if (duplicate.matched_lords.length !== 1) {
    throw new Error("duplicate Dasha lord was not deduplicated");
  }

  const dormant = activateThemesByDasha({
    themes: [theme],
    mahadasaGrahaId: 7,
    antardasaGrahaId: 2,
  })[0];
  if (dormant.status !== "DORMANT" || dormant.activation_level !== "NONE") {
    throw new Error("unrelated Dasha should remain dormant");
  }
});

Deno.test("generic transit adapter connects evidence houses, transit grahas and natal contacts", () => {
  const result = activateThemesByTransit({
    themes: [theme],
    transitAnalysis,
  })[0];

  if (result.status !== "TRIGGERED" || result.activation_level !== "STRONG") {
    throw new Error("independent transit evidence did not converge");
  }

  const reasons = result.triggers.map((trigger) => trigger.reason);
  for (const reason of [
    "EVIDENCE_HOUSE",
    "EVIDENCE_GRAHA_TRANSIT",
    "EVIDENCE_GRAHA_CONTACT",
  ] as const) {
    if (!reasons.includes(reason)) throw new Error("missing trigger: " + reason);
  }

  const contacts = result.triggers.filter(
    (trigger) => trigger.reason === "EVIDENCE_GRAHA_CONTACT",
  );
  if (contacts.length !== 1 || contacts[0].trend !== "APPROACHING") {
    throw new Error("contact trace or duplicate suppression failed");
  }
});

Deno.test("generic transit adapter distinguishes moderate and untriggered states", () => {
  const moderate = activateThemesByTransit({
    themes: [{ ...theme, evidence_grahas: [], evidence_houses: [10] }],
    transitAnalysis: [transitAnalysis[0]],
  })[0];
  if (moderate.activation_level !== "MODERATE") {
    throw new Error("single evidence reason should be moderate");
  }

  const none = activateThemesByTransit({
    themes: [{ ...theme, evidence_grahas: [8], evidence_houses: [6] }],
    transitAnalysis,
  })[0];
  if (none.status !== "UNTRIGGERED" || none.activation_level !== "NONE") {
    throw new Error("unrelated transit should remain untriggered");
  }
});

Deno.test("generic timing engine covers complete and incomplete timing states", () => {
  const common = {
    topic: "CAREER",
    themeCode: "X",
    natalLevel: "STRONG" as const,
  };

  const incomplete = combineGenericTiming({
    ...common,
    dasha: { available: false as const },
    transit: {
      available: true as const,
      status: "TRIGGERED" as const,
      activation_level: "STRONG" as const,
    },
  });
  if (incomplete.status !== "TIMING_INCOMPLETE" || incomplete.data_complete) {
    throw new Error("missing Dasha data was treated as a timing result");
  }

  const incompleteTransit = combineGenericTiming({
    ...common,
    dasha: {
      available: true as const,
      status: "ACTIVE" as const,
      activation_level: "MODERATE" as const,
    },
    transit: { available: false as const },
  });
  if (incompleteTransit.status !== "TIMING_INCOMPLETE") {
    throw new Error("missing transit data was treated as a timing result");
  }

  const cases = [
    {
      dasha: "ACTIVE" as const,
      transit: "TRIGGERED" as const,
      expected: "ACTIVE_NOW" as const,
    },
    {
      dasha: "ACTIVE" as const,
      transit: "UNTRIGGERED" as const,
      expected: "DASHA_ACTIVE_WAITING_TRIGGER" as const,
    },
    {
      dasha: "DORMANT" as const,
      transit: "TRIGGERED" as const,
      expected: "TRANSIT_ONLY" as const,
    },
    {
      dasha: "DORMANT" as const,
      transit: "UNTRIGGERED" as const,
      expected: "DORMANT" as const,
    },
  ];

  for (const item of cases) {
    const result = combineGenericTiming({
      ...common,
      dasha: {
        available: true,
        status: item.dasha,
        activation_level: item.dasha === "ACTIVE" ? "MODERATE" : "NONE",
      },
      transit: {
        available: true,
        status: item.transit,
        activation_level:
          item.transit === "TRIGGERED" ? "MODERATE" : "NONE",
      },
    });
    if (result.status !== item.expected || !result.data_complete) {
      throw new Error("timing state changed: " + item.expected);
    }
    if (!timingStatusSi(result.status)) {
      throw new Error("Sinhala timing label missing");
    }
  }

  if (!timingStatusSi("TIMING_INCOMPLETE")) {
    throw new Error("incomplete timing label missing");
  }
});
