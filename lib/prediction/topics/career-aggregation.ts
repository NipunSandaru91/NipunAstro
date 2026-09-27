import type { CareerCombination } from "./career-combinations.ts";
import type { EvidenceModifier, EvidenceStrength } from "../strength.ts";

type EvidenceBucket = {
  ref: string;
  supporting: EvidenceModifier[];
  contradicting: EvidenceModifier[];
};

export type AggregatedCareerTheme = CareerCombination & {
  level: EvidenceStrength;
  supporting: EvidenceModifier[];
  contradicting: EvidenceModifier[];
  evidence_grahas: number[];
  evidence_houses?: number[];
};

export function aggregateCareerThemes(
  combinations: readonly CareerCombination[],
  buckets: readonly EvidenceBucket[],
): AggregatedCareerTheme[] {
  return combinations.map((combo) => {
    const relevant = buckets.filter((bucket) =>
      combo.evidence_refs.includes(bucket.ref),
    );
    const supporting = relevant.flatMap((bucket) => bucket.supporting);
    const contradicting = relevant.flatMap((bucket) => bucket.contradicting);
    const balance = supporting.length - contradicting.length;

    let level: EvidenceStrength;
    if (balance <= -2) level = "WEAK";
    else if (combo.strength === "STRONG" && balance >= 1) level = "STRONG";
    else if (combo.strength === "WEAK" && balance < 2) level = "WEAK";
    else level = "MODERATE";

    const parsed = combo.evidence_refs
      .map((ref) => ref.match(/^(\d+)L-(\d+)H-G(\d+)$/))
      .filter((match): match is RegExpMatchArray => match !== null);

    const evidence_grahas = [
      ...new Set(parsed.map((match) => Number(match[3]))),
    ];
    const evidence_houses = [
      ...new Set(
        parsed.flatMap((match) => [Number(match[1]), Number(match[2])]),
      ),
    ];

    return {
      ...combo,
      level,
      supporting,
      contradicting,
      evidence_grahas,
      evidence_houses,
    };
  });
}
