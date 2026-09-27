"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveBirthPlace } from "@/lib/calculations/place-resolution";
import { validateCalculationInput } from "@/lib/calculations/validation";
import {
  buildNatalEngineRequest,
  buildTransitEngineRequest,
  validateTransitInput,
} from "@/lib/calculations/action-contract";
import {
  engineHttpError,
  errorMessage,
  hasSession,
  rpcCreateError,
} from "@/lib/calculations/action-errors";
import {
  buildPredictionWindowPlan,
  parsePredictionWindowType,
} from "@/lib/prediction/timing/prediction-window";

export async function createCalculation(formData: FormData) {
  const supabase = await createClient();

  const subjectName = String(formData.get("subject_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "");
  const birthTime = String(formData.get("birth_time") ?? "");
  const placeName = String(formData.get("place_name") ?? "").trim();
  const birthCountry = String(formData.get("birth_country") ?? "").trim();
  const birthState = String(formData.get("birth_state") ?? "").trim();

  if (!subjectName || subjectName.length > 120) {
    redirect("/chart/new?error=invalid_subject_name");
  }

  const resolvedQuery = [placeName, birthState, birthCountry]
    .filter(Boolean)
    .join(", ");

  let resolvedPlace;
  try {
    resolvedPlace = await resolveBirthPlace(resolvedQuery || placeName);
  } catch (error) {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent(
          error instanceof Error
            ? error.message
            : "birth_place_resolution_failed",
        ),
    );
  }

  const timezone = resolvedPlace.timezone;
  const lat = resolvedPlace.latitude;
  const lon = resolvedPlace.longitude;
  const country = resolvedPlace.country;

  const validation = validateCalculationInput({
    birthDate,
    birthTime,
    timezone,
    latitude: lat,
    longitude: lon,
  });

  if (!validation.ok) {
    redirect("/dashboard?error=" + validation.error);
  }

  const { data: calculationId, error: createError } =
    await supabase.rpc("create_user_calculation_v2", {
      p_birth_date: birthDate,
      p_birth_time: birthTime,
      p_timezone: timezone,
      p_latitude: lat,
      p_longitude: lon,
      p_place_name: resolvedPlace.name || placeName || null,
      p_country: country || null,
      p_subject_name: subjectName,
    });

  const createFailure = rpcCreateError(createError, calculationId);
  if (createFailure) {
    redirect("/dashboard?error=" + encodeURIComponent(createFailure));
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!hasSession(session)) {
    redirect("/login?error=session_expired");
  }

  const functionUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/functions/v1/jyotisha-calculator";
  const functionKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let engineError: string | null = null;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: functionKey ?? "",
        Authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify(buildNatalEngineRequest(calculationId)),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      engineError = engineHttpError(response.ok, response.status, detail, "ENGINE");
    }
  } catch (error) {
    engineError = errorMessage(error);
  }

  if (engineError) {
    redirect(
      "/calculations/" +
        calculationId +
        "?error=" +
        encodeURIComponent(engineError),
    );
  }

  redirect("/calculations/" + calculationId);
}


export async function calculateTransit(formData: FormData) {
  const supabase = await createClient();
  const calculationId = String(formData.get("calculation_id") ?? "").trim();
  const transitDate = String(formData.get("transit_date") ?? "").trim();
  const transitTime = String(formData.get("transit_time") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const nodeMethod = String(formData.get("node_method") ?? "MEAN")
    .trim()
    .toUpperCase();

  const transitValidation = validateTransitInput({
    calculationId,
    transitDate,
    transitTime,
    timezone,
  });

  if (!transitValidation.ok) {
    redirect(
      "/calculations/" +
        calculationId +
        "/transit?transit_error=" +
        transitValidation.error,
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!hasSession(session)) redirect("/login?error=session_expired");

  const functionUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/functions/v1/jyotisha-calculator";
  const functionKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let transitError: string | null = null;
  let transitAt: string | null = null;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: functionKey ?? "",
        Authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify(
        buildTransitEngineRequest({
          calculationId,
          transitDate,
          transitTime,
          timezone,
          nodeMethod,
        }),
      ),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      transitError = engineHttpError(
        response.ok,
        response.status,
        detail,
        "TRANSIT",
      );
    } else {
      const payload = (await response.json()) as { transit_at?: unknown };
      transitAt =
        typeof payload.transit_at === "string" ? payload.transit_at : null;
    }
  } catch (error) {
    transitError = errorMessage(error);
  }

  if (transitError) {
    redirect(
      "/calculations/" +
        calculationId +
        "/transit?transit_error=" +
        encodeURIComponent(transitError),
    );
  }

  const snapshotParam = transitAt
    ? "&snapshot=" + encodeURIComponent(transitAt)
    : "";

  redirect(
    "/calculations/" +
      calculationId +
      "/transit?transit=calculated" +
      snapshotParam,
  );
}


export async function generatePredictionWindow(formData: FormData) {
  const supabase = await createClient();
  const calculationId = String(formData.get("calculation_id") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const anchorDate = String(formData.get("anchor_date") ?? "").trim();
  const nodeMethod = String(formData.get("node_method") ?? "MEAN")
    .trim()
    .toUpperCase();
  const selectedBhava = Math.min(
    12,
    Math.max(1, Number(formData.get("bhava")) || 1),
  );
  const windowType = parsePredictionWindowType(
    String(formData.get("window_type") ?? "DAILY").toUpperCase(),
  );

  let planError: string | null = null;
  let plan: ReturnType<typeof buildPredictionWindowPlan> | null = null;

  try {
    plan = buildPredictionWindowPlan(windowType, anchorDate);
  } catch (error) {
    planError = errorMessage(error);
  }

  const baseQuery =
    "?calculation=" +
    encodeURIComponent(calculationId) +
    "&bhava=" +
    selectedBhava +
    "&window=" +
    windowType +
    "&date=" +
    encodeURIComponent(anchorDate);

  if (!plan || planError) {
    redirect(
      "/predictions" +
        baseQuery +
        "&window_error=" +
        encodeURIComponent(planError ?? "INVALID_PREDICTION_WINDOW"),
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!hasSession(session)) redirect("/login?error=session_expired");

  const functionUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/functions/v1/jyotisha-calculator";
  const functionKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let windowError: string | null = null;

  for (let index = 0; index < plan.samples.length; index += 4) {
    const batch = plan.samples.slice(index, index + 4);
    const results = await Promise.all(
      batch.map(async (windowSample) => {
        const validation = validateTransitInput({
          calculationId,
          transitDate: windowSample.local_date,
          transitTime: windowSample.local_time,
          timezone,
        });

        if (!validation.ok) {
          return {
            error: validation.error,
            sample: windowSample.key,
          };
        }

        try {
          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: functionKey ?? "",
              Authorization: "Bearer " + session.access_token,
            },
            body: JSON.stringify(
              buildTransitEngineRequest({
                calculationId,
                transitDate: windowSample.local_date,
                transitTime: windowSample.local_time,
                timezone,
                nodeMethod,
              }),
            ),
            cache: "no-store",
          });

          if (!response.ok) {
            const detail = await response.text();
            return {
              error:
                engineHttpError(
                  response.ok,
                  response.status,
                  detail,
                  "PREDICTION_WINDOW_TRANSIT",
                ) ?? "PREDICTION_WINDOW_TRANSIT_HTTP_" + response.status,
              sample: windowSample.key,
            };
          }

          return { error: null, sample: windowSample.key };
        } catch (error) {
          return {
            error: errorMessage(error),
            sample: windowSample.key,
          };
        }
      }),
    );

    const failed = results.find((result) => result.error);
    if (failed) {
      windowError =
        "WINDOW_SAMPLE_FAILED_" +
        failed.sample +
        ": " +
        String(failed.error ?? "UNKNOWN");
      break;
    }
  }

  if (windowError) {
    redirect(
      "/predictions" +
        baseQuery +
        "&window_error=" +
        encodeURIComponent(windowError),
    );
  }

  redirect("/predictions" + baseQuery + "&window_generated=1");
}
