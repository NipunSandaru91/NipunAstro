"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseCoordinate,
  validateCalculationInput,
} from "@/lib/calculations/validation";

export async function createCalculation(formData: FormData) {
  const supabase = await createClient();

  const birthDate = String(formData.get("birth_date") ?? "");
  const birthTime = String(formData.get("birth_time") ?? "");
  const timezone = String(formData.get("timezone") ?? "").trim();
  const latitude = String(formData.get("latitude") ?? "").trim();
  const longitude = String(formData.get("longitude") ?? "").trim();
  const placeName = String(formData.get("place_name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  const lat = parseCoordinate(latitude);
  const lon = parseCoordinate(longitude);
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
      p_place_name: placeName || null,
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

  const { error: engineError } = await supabase.functions.invoke(
    "jyotisha-calculator",
    {
      body: {
        mode: "natal",
        calculation_id: calculationId,
      },
      headers: {
        Authorization: "Bearer " + session.access_token,
      },
    },
  );

  if (engineError) {
    redirect(
      "/calculations/" +
        calculationId +
        "?error=" +
        encodeURIComponent(engineError.message),
    );
  }

  redirect("/calculations/" + calculationId);
}
