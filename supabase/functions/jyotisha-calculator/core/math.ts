export const norm = (value: number): number => ((value % 360) + 360) % 360;

export const dms = (value: number) => {
  const normalized = norm(value);
  const degrees = Math.floor(normalized);
  const minutesValue = (normalized - degrees) * 60;
  const minutes = Math.floor(minutesValue);
  const seconds = (minutesValue - minutes) * 60;
  return { degrees, minutes, seconds };
};

export const rasi = (value: number) => {
  const normalized = norm(value);
  const number = Math.floor(normalized / 30) + 1;
  const degree = normalized % 30;
  return { number, degree, dms: dms(degree) };
};

export const sind = (value: number): number => Math.sin(value * Math.PI / 180);
export const cosd = (value: number): number => Math.cos(value * Math.PI / 180);
export const tand = (value: number): number => Math.tan(value * Math.PI / 180);
export const atand = (value: number): number => Math.atan(value) * 180 / Math.PI;

export function asc2(x: number, latitude: number, sineObliquity: number, cosineObliquity: number): number {
  let ascendant = -tand(latitude) * sineObliquity + cosineObliquity * cosd(x);
  if (Math.abs(ascendant) < 1e-12) ascendant = 0;

  let sinX = sind(x);
  if (Math.abs(sinX) < 1e-12) sinX = 0;

  if (sinX === 0) {
    ascendant = ascendant < 0 ? -1e-12 : 1e-12;
  } else if (ascendant === 0) {
    ascendant = sinX < 0 ? -90 : 90;
  } else {
    ascendant = atand(sinX / ascendant);
  }

  if (ascendant < 0) ascendant = 180 + ascendant;
  return ascendant;
}

export function asc1(x1: number, latitude: number, sineObliquity: number, cosineObliquity: number): number {
  const normalized = norm(x1);
  const quadrant = Math.floor(normalized / 90) + 1;

  if (Math.abs(90 - latitude) < 1e-12) return 180;
  if (Math.abs(90 + latitude) < 1e-12) return 0;

  let ascendant: number;
  if (quadrant === 1) {
    ascendant = asc2(normalized, latitude, sineObliquity, cosineObliquity);
  } else if (quadrant === 2) {
    ascendant = 180 - asc2(180 - normalized, -latitude, sineObliquity, cosineObliquity);
  } else if (quadrant === 3) {
    ascendant = 180 + asc2(normalized - 180, -latitude, sineObliquity, cosineObliquity);
  } else {
    ascendant = 360 - asc2(360 - normalized, latitude, sineObliquity, cosineObliquity);
  }

  return norm(ascendant);
}

export function mcFromArmc(armc: number, obliquity: number): number {
  let mc: number;
  const normalized = norm(armc);

  if (
    Math.abs(normalized - 90) > 1e-12 &&
    Math.abs(normalized - 270) > 1e-12
  ) {
    mc = atand(tand(armc) / cosd(obliquity));
    if (armc > 90 && armc <= 270) mc += 180;
  } else {
    mc = Math.abs(normalized - 90) <= 1e-12 ? 90 : 270;
  }

  return norm(mc);
}
