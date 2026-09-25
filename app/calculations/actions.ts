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
  const placeName = String(formData.get("place_name") ?? "").trim();
  let resolvedPlace;
  try {
    resolvedPlace = await resolveBirthPlace(placeName);
  } catch (error) {
    redirect(
      "/?error=" +
        encodeURIComponent(
          error instanceof Error ? error.message : "birth_place_resolution_failed",
        ),
    );
  }

  const timezone = resolvedPlace.timezone;
  const lat = resolvedPlace.latitude;
  const lon = resolvedPlace.longitude;
  const country = resolvedPlace.country;

