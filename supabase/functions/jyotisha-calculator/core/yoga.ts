export type YogaPosition = { graha_id: number; rasi_id: number; bhava: number };

export type YogaRule = {
  rule_code: string;
  name: string;
  formation_conditions: Record<string, unknown>;
  planets_involved: string[];
  houses_involved: number[];
};

export type YogaEvaluation = {
  rule_code: string;
  formation_status: "FORMED" | "NOT_FORMED";
  qualification: string;
  strength: "PRIMARY" | "NONE";
  matched_conditions: string[];
  failed_conditions: string[];
  evidence: Record<string, unknown>;
  engine_version: "YOGA_ENGINE_V1";
};

const OWN: Record<number, number[]> = { 3: [1, 8], 4: [3, 6], 5: [9, 12], 6: [2, 7], 7: [10, 11] };
const EXALT: Record<number, number> = { 3: 10, 4: 6, 5: 4, 6: 12, 7: 7 };

function validRasi(value: number) { if (!Number.isInteger(value) || value < 1 || value > 12) throw new Error("rasi_id must be an integer from 1 to 12"); }
function validBhava(value: number) { if (!Number.isInteger(value) || value < 1 || value > 12) throw new Error("bhava must be an integer from 1 to 12"); }

export function isKendra(bhava: number) { validBhava(bhava); return [1, 4, 7, 10].includes(bhava); }
export function isDusthana(bhava: number) { validBhava(bhava); return [6, 8, 12].includes(bhava); }
export function planetSignCondition(grahaId: number, rasiId: number): "OWN" | "EXALTATION" | null {
  validRasi(rasiId);
  if ((OWN[grahaId] ?? []).includes(rasiId)) return "OWN";
  return EXALT[grahaId] === rasiId ? "EXALTATION" : null;
}
function find(positions: YogaPosition[], grahaId: number) { return positions.find(p => p.graha_id === grahaId); }
function evaluateMahapurusha(rule: YogaRule, positions: YogaPosition[]): YogaEvaluation {
  const graha = Number((rule.formation_conditions.planet as string) === "MANGALA" ? 3 : (rule.formation_conditions.planet as string) === "BUDHA" ? 4 : (rule.formation_conditions.planet as string) === "GURU" ? 5 : (rule.formation_conditions.planet as string) === "SHUKRA" ? 6 : 7);
  const p = find(positions, graha), matched: string[] = [], failed: string[] = [];
  if (!p) failed.push("planet_position"); else { if (isKendra(p.bhava)) matched.push("kendra"); else failed.push("kendra"); const sign = planetSignCondition(graha, p.rasi_id); if (sign) matched.push(sign); else failed.push("own_or_exaltation_sign"); }
  const formed = failed.length === 0;
  return { rule_code: rule.rule_code, formation_status: formed ? "FORMED" : "NOT_FORMED", qualification: formed ? "ALL_FORMATION_CONDITIONS_MET" : "FORMATION_CONDITIONS_NOT_MET", strength: formed ? "PRIMARY" : "NONE", matched_conditions: matched, failed_conditions: failed, evidence: { graha_id: graha, position: p ?? null }, engine_version: "YOGA_ENGINE_V1" };
}

export function evaluateYogaRule(rule: YogaRule, positions: YogaPosition[], lagnaRasiId: number): YogaEvaluation {
  validRasi(lagnaRasiId);
  if (!rule?.rule_code) throw new Error("Yoga rule_code is required");
  if (rule.rule_code === "RUCHAKA" || rule.rule_code === "BHADRA" || rule.rule_code === "HAMSA" || rule.rule_code === "MALAVYA" || rule.rule_code === "SASA") return evaluateMahapurusha(rule, positions);
  const matched: string[] = [], failed: string[] = [];
  const moon = find(positions, 2), jupiter = find(positions, 5);
  if (rule.rule_code === "GAJA_KESARI") {
    if (!moon || !jupiter) failed.push("moon_and_jupiter_position");
    else { const d = ((jupiter.bhava - moon.bhava + 12) % 12) + 1; if ([1,4,7,10].includes(d)) matched.push("jupiter_from_moon_kendra"); else failed.push("jupiter_from_moon_kendra"); }
  } else if (rule.rule_code === "KEMADRUMA") {
    if (!moon) failed.push("moon_position");
    else { const adjacent = positions.filter(p => p.graha_id !== 2 && (p.bhava === (((moon.bhava) % 12) + 1) || p.bhava === (((moon.bhava + 10) % 12) + 1))); if (adjacent.length === 0) matched.push("moon_adjacent_houses_empty"); else failed.push("moon_adjacent_houses_empty"); }
  } else if (["VIPARITA_HARSA", "VIPARITA_SARALA", "VIPARITA_VIMALA"].includes(rule.rule_code)) {
    const lordHouse = Number((rule.formation_conditions.lord_of as number[])[0]);
    const lordRasi = ((lagnaRasiId - 1 + lordHouse - 1) % 12) + 1;
    const lordGraha = ({6: 4, 8: 3, 12: 5} as Record<number, number>)[lordHouse];
    const p = find(positions, lordGraha);
    if (p && isDusthana(p.bhava)) matched.push("dusthana_lord_in_dusthana"); else failed.push("dusthana_lord_in_dusthana");
  } else { failed.push("unsupported_rule"); }
  const formed = failed.length === 0;
  return { rule_code: rule.rule_code, formation_status: formed ? "FORMED" : "NOT_FORMED", qualification: formed ? "ALL_FORMATION_CONDITIONS_MET" : "FORMATION_CONDITIONS_NOT_MET", strength: formed ? "PRIMARY" : "NONE", matched_conditions: matched, failed_conditions: failed, evidence: { lagna_rasi_id: lagnaRasiId, moon: moon ?? null, jupiter: jupiter ?? null }, engine_version: "YOGA_ENGINE_V1" };
}

export function evaluateAllYogaRules(rules: YogaRule[], positions: YogaPosition[], lagnaRasiId: number): YogaEvaluation[] { return rules.map(rule => evaluateYogaRule(rule, positions, lagnaRasiId)); }
