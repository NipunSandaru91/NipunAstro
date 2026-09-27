import type {
  PredictionEvidence,
  PredictionTopic,
} from "../evidence.ts";
import type {
  EvidenceModifier,
  EvidenceStrength,
} from "../strength.ts";
import { evaluateBhavaLordPlacement } from "../rules/bhava-lord-placement.ts";

type Position = { graha_id: number; rasi_id: number };
type ShadbalaRow = { graha_id: number; total_bala_rupa: number };

type Input = {
  lagnaRasiId: number;
  positions: Position[];
  shadbala: ShadbalaRow[];
};

type GenericTopic = Exclude<PredictionTopic, "CAREER">;

type ThemeConfig = {
  code: string;
  source_bhavas: readonly number[];
  text_si: string;
};

type TopicConfig = {
  primary: readonly number[];
  contextual: readonly number[];
  themes: readonly ThemeConfig[];
};

export type GenericTopicEvidenceItem = {
  source_bhava: number;
  evidence: PredictionEvidence;
};

export type GenericTopicTheme = {
  code: string;
  level: EvidenceStrength;
  text_si: string;
  evidence_refs: string[];
  evidence_grahas: number[];
  evidence_houses: number[];
  supporting: EvidenceModifier[];
  contradicting: EvidenceModifier[];
  rule_version: "GENERIC_TOPIC_THEMES_V1";
};

export type GenericTopicNatalModel = {
  topic: GenericTopic;
  model_version: "GENERIC_TOPIC_NATAL_V1";
  primary: GenericTopicEvidenceItem[];
  contextual: GenericTopicEvidenceItem[];
  themes: GenericTopicTheme[];
};

export const TOPIC_LABEL_SI: Record<PredictionTopic, string> = {
  CAREER: "වෘත්තිය",
  EDUCATION: "අධ්‍යාපනය",
  RELATIONSHIP: "සම්බන්ධතා",
  FINANCE: "මූල්‍ය",
  HEALTH: "සුවතාව",
  SPIRITUALITY: "ආධ්‍යාත්මිකත්වය",
};

const CONFIG: Record<GenericTopic, TopicConfig> = {
  EDUCATION: {
    primary: [4, 5, 9],
    contextual: [2, 11],
    themes: [
      {
        code: "LEARNING_FOUNDATION",
        source_bhavas: [4, 5],
        text_si:
          "4 සහ 5 භාව අධිපති සාධක මූලික අධ්‍යාපන පදනම, බුද්ධිමය ක්‍රියාකාරිත්වය සහ ඉගෙනීමේ රටාව විග්‍රහ කිරීමට භාවිතා කරයි.",
      },
      {
        code: "HIGHER_LEARNING",
        source_bhavas: [5, 9],
        text_si:
          "5 සහ 9 භාව අධිපති සාධක උසස් අධ්‍යාපනය, විශේෂඥ දැනුම සහ දිගුකාලීන ශාස්ත්‍රීය වර්ධනයට සම්බන්ධ evidence layer එකක් සපයයි.",
      },
      {
        code: "EDUCATION_OUTCOMES",
        source_bhavas: [2, 9, 11],
        text_si:
          "2, 9 සහ 11 භාව සම්බන්ධතා දැනුමෙන් ලැබෙන ප්‍රතිඵල, සම්පත් සහ ඉලක්ක සපුරාගැනීමේ තේමාව නිරීක්ෂණය කරයි.",
      },
    ],
  },
  RELATIONSHIP: {
    primary: [7, 2, 5],
    contextual: [8, 11],
    themes: [
      {
        code: "PARTNERSHIP_COMMITMENT",
        source_bhavas: [7, 2],
        text_si:
          "7 සහ 2 භාව අධිපති සාධක partnership, එකඟතාව සහ පවුල් ඒකාබද්ධතාව පිළිබඳ ජන්ම evidence එකක් සපයයි.",
      },
      {
        code: "ROMANCE_BONDING",
        source_bhavas: [5, 7],
        text_si:
          "5 සහ 7 භාව සම්බන්ධ සාධක ආකර්ෂණය, ආදර බැඳීම සහ partnership development තේමාව විග්‍රහ කරයි.",
      },
      {
        code: "SHARED_LIFE_CHANGE",
        source_bhavas: [7, 8, 11],
        text_si:
          "7, 8 සහ 11 භාව සම්බන්ධ evidence එක හවුල් ජීවිතයේ ගැඹුරු වෙනස්කම්, අරමුණු සහ දිගුකාලීන සම්බන්ධතා රටා නිරීක්ෂණය කරයි.",
      },
    ],
  },
  FINANCE: {
    primary: [2, 11],
    contextual: [5, 6, 9, 10],
    themes: [
      {
        code: "INCOME_ACCUMULATION",
        source_bhavas: [2, 11],
        text_si:
          "2 සහ 11 භාව අධිපති සාධක ආදායම, සම්පත් එකතු කිරීම සහ ලාභ තේමාව සඳහා මූලික evidence එක සපයයි.",
      },
      {
        code: "WORK_INCOME",
        source_bhavas: [6, 10, 11],
        text_si:
          "6, 10 සහ 11 භාව සාධක සේවය, වෘත්තීය ක්‍රියාකාරිත්වය සහ එයින් ලැබෙන ආදායම් රටාව අතර සම්බන්ධය නිරීක්ෂණය කරයි.",
      },
      {
        code: "WEALTH_EXPANSION",
        source_bhavas: [2, 5, 9, 11],
        text_si:
          "2, 5, 9 සහ 11 භාව evidence එක දිගුකාලීන සම්පත් වර්ධනය, සැලසුම් සහ අවස්ථා පිළිබඳ සාධක එකට බැඳී පෙන්වයි.",
      },
    ],
  },
  HEALTH: {
    primary: [1, 6, 8],
    contextual: [12],
    themes: [
      {
        code: "VITALITY_WELLBEING",
        source_bhavas: [1, 6],
        text_si:
          "1 සහ 6 භාව අධිපති සාධක ශරීර සුවතාව, දෛනික රිද්මය සහ resilience පිළිබඳ සාම්ප්‍රදායික ජ්‍යොතිෂ evidence ලෙස පමණක් භාවිතා කරයි.",
      },
      {
        code: "RECOVERY_REST_PATTERN",
        source_bhavas: [6, 8, 12],
        text_si:
          "6, 8 සහ 12 භාව සම්බන්ධතා විවේකය, recovery rhythm සහ අභියෝග වලට ප්‍රතිචාර දක්වන රටා පිළිබඳ non-diagnostic wellbeing theme එකක් සපයයි.",
      },
    ],
  },
  SPIRITUALITY: {
    primary: [9, 12],
    contextual: [5, 8],
    themes: [
      {
        code: "DHARMA_STUDY",
        source_bhavas: [5, 9],
        text_si:
          "5 සහ 9 භාව අධිපති සාධක දර්ශනය, ධර්ම අධ්‍යයනය, ගුරු සහ උසස් දැනුම සම්බන්ධ තේමාව නිරීක්ෂණය කරයි.",
      },
      {
        code: "CONTEMPLATIVE_WITHDRAWAL",
        source_bhavas: [9, 12],
        text_si:
          "9 සහ 12 භාව evidence එක නිශ්ශබ්දතාව, contemplative practice, retreat සහ අභ්‍යන්තර විමසුම සඳහා සංකේතාත්මක timing theme එකක් සපයයි.",
      },
      {
        code: "TRANSFORMATIVE_INQUIRY",
        source_bhavas: [8, 12],
        text_si:
          "8 සහ 12 භාව සම්බන්ධ evidence එක ගැඹුරු අභ්‍යන්තර පරිවර්තනය, ගුප්ත විමසුම සහ අත්හැරීමේ තේමාව නිරීක්ෂණය කරයි.",
      },
    ],
  },
};

function evidenceRef(item: GenericTopicEvidenceItem) {
  return `${item.source_bhava}L-${item.evidence.placement.bhava}H-G${item.evidence.placement.graha_id}`;
}

function item(
  topic: GenericTopic,
  sourceBhava: number,
  input: Input,
): GenericTopicEvidenceItem {
  return {
    source_bhava: sourceBhava,
    evidence: evaluateBhavaLordPlacement({
      lagnaRasiId: input.lagnaRasiId,
      sourceBhava,
      positions: input.positions,
      shadbala: input.shadbala,
      topic,
      polarity: "SUPPORTING",
    }),
  };
}

function themeFrom(
  config: ThemeConfig,
  items: readonly GenericTopicEvidenceItem[],
): GenericTopicTheme {
  const relevant = items.filter((entry) =>
    config.source_bhavas.includes(entry.source_bhava),
  );
  const supporting = relevant.flatMap(
    (entry) => entry.evidence.strength.supporting,
  );
  const contradicting = relevant.flatMap(
    (entry) => entry.evidence.strength.contradicting,
  );
  const balance = supporting.length - contradicting.length;
  const level: EvidenceStrength =
    balance >= 2 ? "STRONG" : balance <= -2 ? "WEAK" : "MODERATE";

  return {
    code: config.code,
    level,
    text_si: config.text_si,
    evidence_refs: relevant.map(evidenceRef),
    evidence_grahas: [
      ...new Set(
        relevant.map((entry) => entry.evidence.placement.graha_id),
      ),
    ],
    evidence_houses: [
      ...new Set(
        relevant.flatMap((entry) => [
          entry.source_bhava,
          entry.evidence.placement.bhava,
        ]),
      ),
    ],
    supporting,
    contradicting,
    rule_version: "GENERIC_TOPIC_THEMES_V1",
  };
}

export function parsePredictionTopic(
  value: string | null | undefined,
): PredictionTopic {
  if (
    value === "EDUCATION" ||
    value === "RELATIONSHIP" ||
    value === "FINANCE" ||
    value === "HEALTH" ||
    value === "SPIRITUALITY"
  ) {
    return value;
  }
  return "CAREER";
}

export function buildGenericTopicNatalModel(
  topic: GenericTopic,
  input: Input,
): GenericTopicNatalModel {
  const config = CONFIG[topic];
  const primary = config.primary.map((bhava) => item(topic, bhava, input));
  const contextual = config.contextual.map((bhava) =>
    item(topic, bhava, input),
  );
  const all = [...primary, ...contextual];

  return {
    topic,
    model_version: "GENERIC_TOPIC_NATAL_V1",
    primary,
    contextual,
    themes: config.themes.map((theme) => themeFrom(theme, all)),
  };
}
