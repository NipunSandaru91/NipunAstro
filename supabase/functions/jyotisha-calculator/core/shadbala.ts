export const SHADBALA_GRAHAS = [1, 2, 3, 4, 5, 6, 7] as const;

export type ShadbalaComponents = {
  sthana_bala: number;
  dig_bala: number;
  kala_bala: number;
  cheshta_bala: number;
  naisargika_bala: number;
  drik_bala: number;
};

export type ShadbalaResult = ShadbalaComponents & {
  total_bala_virupa: number;
  total_bala_rupa: number;
  unit: "RUPA";
  calculation_version: "SHADBALA_AGGREGATION_V1";
};

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(label + " must be finite");
  return value;
}

export function aggregateShadbala(components: ShadbalaComponents): ShadbalaResult {
  const values = {
    sthana_bala: finite(components.sthana_bala, "sthana_bala"),
    dig_bala: finite(components.dig_bala, "dig_bala"),
    kala_bala: finite(components.kala_bala, "kala_bala"),
    cheshta_bala: finite(components.cheshta_bala, "cheshta_bala"),
    naisargika_bala: finite(components.naisargika_bala, "naisargika_bala"),
    drik_bala: finite(components.drik_bala, "drik_bala"),
  };
  const total_bala_virupa =
    values.sthana_bala +
    values.dig_bala +
    values.kala_bala +
    values.cheshta_bala +
    values.naisargika_bala +
    values.drik_bala;

  return {
    ...values,
    total_bala_virupa,
    total_bala_rupa: total_bala_virupa / 60,
    unit: "RUPA",
    calculation_version: "SHADBALA_AGGREGATION_V1",
  };
}

export function assertClassicalGraha(grahaId: number): void {
  if (!Number.isInteger(grahaId) || grahaId < 1 || grahaId > 7) {
    throw new Error("Shadbala graha_id must be an integer from 1 to 7");
  }
}
