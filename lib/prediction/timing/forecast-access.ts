import type { PredictionWindowType } from "@/lib/prediction/timing/prediction-window";

export type ForecastAccountType = "PERSONAL" | "PROFESSIONAL" | null | undefined;
export type PredictionView = "predictions" | "forecast";

const ALL_WINDOWS: readonly PredictionWindowType[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
];

export function isPersonalAccount(accountType: ForecastAccountType) {
  return accountType === "PERSONAL";
}

export function canAccessPredictionView(
  accountType: ForecastAccountType,
  view: PredictionView,
) {
  return !isPersonalAccount(accountType) || view === "forecast";
}

export function allowedForecastWindows(
  accountType: ForecastAccountType,
): readonly PredictionWindowType[] {
  return isPersonalAccount(accountType) ? ["DAILY"] : ALL_WINDOWS;
}

export function normalizeForecastWindow(
  accountType: ForecastAccountType,
  requested: PredictionWindowType,
): PredictionWindowType {
  return isPersonalAccount(accountType) ? "DAILY" : requested;
}

export function predictionBasePath(view: PredictionView) {
  return view === "forecast" ? "/forecast" : "/predictions";
}
