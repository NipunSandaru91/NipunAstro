export type VargaPosition = {
  varga_id: number;
  source_longitude: number;
  source_rasi_id: number;
  division_index: number;
  varga_rasi_id: number;
  varga_degree: number;
  rule_version: "CLASSICAL_TDD_V1";
};

const rule_version = "CLASSICAL_TDD_V1" as const;

export function allVargaPositions(longitude: number): VargaPosition[] {
  const normalized = ((longitude % 360) + 360) % 360;
  const sourceRasi = Math.floor(normalized / 30) + 1;
  const degree = normalized - (sourceRasi - 1) * 30;
  const output: VargaPosition[] = [];

  const addEqualDivision = (vargaId: number, divisions: number, startRasi: number) => {
    const part = 30 / divisions;
    const divisionIndex = Math.floor(degree / part) + 1;
    const vargaRasi = ((startRasi - 1 + divisionIndex - 1) % 12) + 1;
    output.push({
      varga_id: vargaId,
      source_longitude: normalized,
      source_rasi_id: sourceRasi,
      division_index: divisionIndex,
      varga_rasi_id: vargaRasi,
      varga_degree: (degree - Math.floor(degree / part) * part) * divisions,
      rule_version,
    });
  };

  {
    const part = 15;
    const divisionIndex = Math.floor(degree / part) + 1;
    const vargaRasi =
      ((sourceRasi % 2 === 1 && divisionIndex === 1) ||
      (sourceRasi % 2 === 0 && divisionIndex === 2))
        ? 5
        : 4;

    output.push({
      varga_id: 2,
      source_longitude: normalized,
      source_rasi_id: sourceRasi,
      division_index: divisionIndex,
      varga_rasi_id: vargaRasi,
      varga_degree: (degree - Math.floor(degree / part) * part) * 2,
      rule_version,
    });
  }

  {
    const part = 10;
    const divisionIndex = Math.floor(degree / part) + 1;
    const vargaRasi = ((sourceRasi - 1 + [0, 4, 8][divisionIndex - 1]) % 12) + 1;
    output.push({
      varga_id: 3,
      source_longitude: normalized,
      source_rasi_id: sourceRasi,
      division_index: divisionIndex,
      varga_rasi_id: vargaRasi,
      varga_degree: (degree - (divisionIndex - 1) * part) * 3,
      rule_version,
    });
  }

  {
    const part = 7.5;
    const divisionIndex = Math.floor(degree / part) + 1;
    const vargaRasi = ((sourceRasi - 1 + (divisionIndex - 1) * 3) % 12) + 1;
    output.push({
      varga_id: 4,
      source_longitude: normalized,
      source_rasi_id: sourceRasi,
      division_index: divisionIndex,
      varga_rasi_id: vargaRasi,
      varga_degree: (degree - (divisionIndex - 1) * part) * 4,
      rule_version,
    });
  }

  addEqualDivision(5, 7, sourceRasi % 2 === 1 ? sourceRasi : ((sourceRasi + 5) % 12) + 1);

  const d9Start =
    sourceRasi % 3 === 1
      ? sourceRasi
      : sourceRasi % 3 === 2
        ? ((sourceRasi + 7) % 12) + 1
        : ((sourceRasi + 3) % 12) + 1;
  addEqualDivision(6, 9, d9Start);

  addEqualDivision(7, 10, sourceRasi % 2 === 1 ? sourceRasi : ((sourceRasi + 7) % 12) + 1);
  addEqualDivision(8, 12, sourceRasi);

  const d16Start = sourceRasi % 3 === 1 ? sourceRasi : sourceRasi % 3 === 2 ? 5 : 9;
  addEqualDivision(9, 16, d16Start);

  const d20Start = sourceRasi % 3 === 1 ? 1 : sourceRasi % 3 === 2 ? 9 : 5;
  addEqualDivision(10, 20, d20Start);

  addEqualDivision(11, 24, sourceRasi % 2 === 1 ? 5 : 4);

  const d27Start =
    sourceRasi === 1 || sourceRasi === 5 || sourceRasi === 9
      ? 1
      : sourceRasi === 2 || sourceRasi === 6 || sourceRasi === 10
        ? 4
        : sourceRasi === 3 || sourceRasi === 7 || sourceRasi === 11
          ? 7
          : 10;
  addEqualDivision(12, 27, d27Start);

  {
    const odd = sourceRasi % 2 === 1;
    const segmentSizes = odd ? [5, 5, 8, 7, 5] : [5, 7, 8, 5, 5];
    const starts = odd ? [1, 11, 9, 3, 7] : [2, 6, 12, 10, 8];
    let accumulated = 0;

    for (let i = 0; i < 5; i += 1) {
      if (degree < accumulated + segmentSizes[i] || i === 4) {
        const divisionIndex = i + 1;
        output.push({
          varga_id: 13,
          source_longitude: normalized,
          source_rasi_id: sourceRasi,
          division_index: divisionIndex,
          varga_rasi_id: starts[i],
          varga_degree: (degree - accumulated) * 30 / segmentSizes[i],
          rule_version,
        });
        break;
      }
      accumulated += segmentSizes[i];
    }
  }

  addEqualDivision(14, 40, sourceRasi % 2 === 1 ? 1 : 7);
  addEqualDivision(15, 45, sourceRasi % 3 === 1 ? 1 : sourceRasi % 3 === 2 ? 5 : 9);

  const d60Part = 0.5;
  const d60Index = Math.floor((degree + 1e-12) / d60Part) + 1;
  const d60VargaRasi = ((d60Index - 1) % 12) + 1;
  const d60Degree = (degree - (d60Index - 1) * d60Part) * 60;

  output.push({
    varga_id: 16,
    source_longitude: normalized,
    source_rasi_id: sourceRasi,
    division_index: d60Index,
    varga_rasi_id: d60VargaRasi,
    varga_degree: Math.abs(d60Degree - 30) < 1e-9 ? 0 : d60Degree,
    rule_version,
  });

  return output;
}
