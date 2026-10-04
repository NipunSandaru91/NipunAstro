/// <reference lib="deno.ns" />
import {
  allowedForecastWindows,
  canAccessPredictionView,
  isPersonalAccount,
  normalizeForecastWindow,
  predictionBasePath,
} from "../../lib/prediction/timing/forecast-access.ts";

Deno.test("Personal accounts are recognized explicitly", () => {
  if (!isPersonalAccount("PERSONAL")) throw new Error("Personal account not recognized");
  if (isPersonalAccount("PROFESSIONAL")) throw new Error("Professional account treated as Personal");
  if (isPersonalAccount(null)) throw new Error("Missing profile treated as Personal");
});

Deno.test("Personal accounts can access forecast but not Professional prediction workspace", () => {
  if (!canAccessPredictionView("PERSONAL", "forecast")) {
    throw new Error("Personal forecast access blocked");
  }
  if (canAccessPredictionView("PERSONAL", "predictions")) {
    throw new Error("Personal prediction workspace access allowed");
  }
  if (!canAccessPredictionView("PROFESSIONAL", "predictions")) {
    throw new Error("Professional prediction workspace access blocked");
  }
});

Deno.test("Personal forecast is daily only", () => {
  const allowed = allowedForecastWindows("PERSONAL");
  if (allowed.join(",") !== "DAILY") {
    throw new Error("Personal forecast exposed non-daily windows");
  }
  for (const requested of ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const) {
    if (normalizeForecastWindow("PERSONAL", requested) !== "DAILY") {
      throw new Error("Personal window was not normalized to DAILY");
    }
  }
});

Deno.test("Professional forecast keeps all supported windows", () => {
  const allowed = allowedForecastWindows("PROFESSIONAL");
  if (allowed.join(",") !== "DAILY,WEEKLY,MONTHLY,YEARLY") {
    throw new Error("Professional forecast windows changed");
  }
  if (normalizeForecastWindow("PROFESSIONAL", "MONTHLY") !== "MONTHLY") {
    throw new Error("Professional window was unexpectedly rewritten");
  }
});

Deno.test("Prediction view maps to the correct route", () => {
  if (predictionBasePath("forecast") !== "/forecast") {
    throw new Error("Forecast base path changed");
  }
  if (predictionBasePath("predictions") !== "/predictions") {
    throw new Error("Prediction base path changed");
  }
});
