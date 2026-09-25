"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveBirthPlace } from "@/lib/calculations/place-resolution";
import { validateCalculationInput } from "@/lib/calculations/validation";

export async function createCalculation(formData: FormData) {
  const supabase = await createClient();

  const birthDate = String(formData.get("birth_date") ?? "");
  const birthTime = String(formData.get("birth_time") ?? "");
  const placeName = String(formData.get("place_name") ?? "").trim();
  const birthCountry = String(formData.get("birth_country") ?? "").trim();
  const birthState = String(formData.get("birth_state") ?? "").trim();

  const resolvedQuery = [placeName, birthState, birthCountry]
    .filter(Boolean)
    .join(", ");

  let resolvedPlace;
  try {
    resolvedPlace = await resolveBirthPlace(resolvedQuery || placeName);
  } catch (error) {
    redirect(
      "/?error=" +
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
    redirect("/?error=" + validation.error);
  }

  const { data: calculationId, error: createError } =
    await supabase.rpc("create_user_calculation", {
      p_birth_date: birthDate,
      p_birth_time: birthTime,
      p_timezone: timezone,
      p_latitude: lat,
      p_longitude: lon,
      p_place_name: resolvedPlace.name || placeName || null,
      p_country: country || null,
    });

  if (createError || !calculationId) {
    redirect(
      "/?error=" +
        encodeURIComponent(
          createError?.message ?? "CALCULATION_CREATE_FAILED",
        ),
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
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
      body: JSON.stringify({
        mode: "natal",
        calculation_id: calculationId,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      engineError = detail || `ENGINE_HTTP_${response.status}`;
    }
  } catch (error) {
    engineError = error instanceof Error ? error.message : String(error);
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
  const nodeMethod = String(formData.get("node_method") ?? "MEAN").trim().toUpperCase();

  if (!calculationId || !transitDate || !transitTime || !timezone) {
    redirect("/calculations/" + calculationId + "?transit_error=missing_input");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) redirect("/login?error=session_expired");

  const functionUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL +
    "/functions/v1/jyotisha-calculator";
  const functionKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: functionKey ?? "",
        Authorization: "Bearer " + session.access_token,
      },
      body: JSON.stringify({
        mode: "transit",
        calculation_id: calculationId,
        transit_date: transitDate,
        transit_time: transitTime,
        timezone,
        node_method: nodeMethod === "TRUE" ? "TRUE" : "MEAN",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      redirect(
        "/calculations/" +
          calculationId +
          "?transit_error=" +
          encodeURIComponent(detail || "TRANSIT_HTTP_" + response.status),
      );
    }
  } catch (error) {
    redirect(
      "/calculations/" +
        calculationId +
        "?transit_error=" +
        encodeURIComponent(error instanceof Error ? error.message : String(error)),
    );
  }

  redirect("/calculations/" + calculationId + "?transit=calculated");
}
