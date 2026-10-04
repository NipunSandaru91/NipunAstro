import { PHILIPPINES_CITIES_BY_REGION, PHILIPPINES_REGIONS } from "@/lib/locations/philippines";
import { NextRequest, NextResponse } from "next/server";

const API = "https://countriesnow.space/api/v0.1";

type Country = { name?: string };
type State = { name?: string; state_code?: string };
type ApiPayload<T> = { error?: boolean; msg?: string; data?: T };

const SRI_LANKA_PROVINCES = [
  "Central Province",
  "Eastern Province",
  "North Central Province",
  "North Western Province",
  "Northern Province",
  "Sabaragamuwa Province",
  "Southern Province",
  "Uva Province",
  "Western Province",
] as const;

const SRI_LANKA_CITIES_BY_PROVINCE: Record<string, string[]> = {
  "Central Province": ["Kandy", "Matale", "Nawalapitiya", "Hatton", "Gampola", "Dambulla"],
  "Eastern Province": ["Trincomalee", "Batticaloa", "Kalmunai", "Ampara", "Kattankudy", "Akkaraipattu"],
  "North Central Province": ["Anuradhapura", "Polonnaruwa", "Kekirawa", "Medawachchiya", "Habarana"],
  "North Western Province": ["Kurunegala", "Puttalam", "Chilaw", "Kuliyapitiya", "Narammala", "Wennappuwa"],
  "Northern Province": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya", "Point Pedro", "Chavakachcheri"],
  "Sabaragamuwa Province": ["Ratnapura", "Kegalle", "Balangoda", "Embilipitiya", "Mawanella", "Avissawella"],
  "Southern Province": ["Galle", "Matara", "Hambantota", "Tangalle", "Weligama", "Ambalangoda"],
  "Uva Province": ["Tanamalwila", "Badulla", "Bandarawela", "Ella", "Haputale", "Monaragala", "Wellawaya", "Mahiyanganaya"],
  "Western Province": ["Colombo", "Negombo", "Sri Jayawardenepura Kotte", "Gampaha", "Kalutara", "Panadura", "Moratuwa", "Wattala"],
};

const SRI_LANKA_DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  "Central Province": [
    "Kandy District",
    "Matale District",
    "Nuwara Eliya District",
  ],
  "Eastern Province": [
    "Ampara District",
    "Batticaloa District",
    "Trincomalee District",
  ],
  "North Central Province": [
    "Anuradhapura District",
    "Polonnaruwa District",
  ],
  "North Western Province": [
    "Kurunegala District",
    "Puttalam District",
  ],
  "Northern Province": [
    "Jaffna District",
    "Kilinochchi District",
    "Mannar District",
    "Mullaitivu District",
    "Vavuniya District",
  ],
  "Sabaragamuwa Province": [
    "Kegalle District",
    "Ratnapura district",
  ],
  "Southern Province": [
    "Galle District",
    "Hambantota District",
    "Matara District",
  ],
  "Uva Province": [
    "Badulla District",
    "Monaragala District",
  ],
  "Western Province": [
    "Colombo District",
    "Gampaha District",
    "Kalutara District",
  ],
};

async function readJson<T>(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`location_source_http_${response.status}`);
  }

  const payload = (await response.json()) as ApiPayload<T>;

  if (payload.error) {
    throw new Error(payload.msg ?? "location_source_failed");
  }

  return payload;
}

async function getStates(country: string): Promise<State[]> {
  const url = new URL(`${API}/countries/states/q`);
  url.searchParams.set("country", country);

  const payload = await readJson<{
    name?: string;
    iso2?: string;
    states?: State[];
  }>(url.toString());

  return payload.data?.states ?? [];
}

async function getCitiesForState(country: string, state: string): Promise<string[]> {
  const candidates = [
    state,
    state.replace(/\s+District$/i, ""),
    state.replace(/\s+Province$/i, ""),
  ].filter(Boolean);

  const results: string[] = [];

  for (const candidate of candidates) {
    try {
      const url = new URL(`${API}/countries/state/cities/q`);
      url.searchParams.set("country", country);
      url.searchParams.set("state", candidate);

      const payload = await readJson<string[]>(url.toString());
      results.push(
        ...(payload.data ?? [])
          .map((name) => name.trim())
          .filter(Boolean),
      );
    } catch {
      // CountriesNow uses inconsistent state naming for some Sri Lankan data.
    }
  }

  return [...new Set(results)];
}

export async function GET(request: NextRequest) {
  const level = request.nextUrl.searchParams.get("level");
  const country = request.nextUrl.searchParams.get("country")?.trim() ?? "";
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";

  try {
    if (level === "timezone") {
      const latitudeRaw = request.nextUrl.searchParams.get("lat")?.trim() ?? "";
      const longitudeRaw = request.nextUrl.searchParams.get("lon")?.trim() ?? "";
      const latitude = Number(latitudeRaw);
      const longitude = Number(longitudeRaw);
      if (
        !latitudeRaw || !longitudeRaw ||
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180
      ) {
        return NextResponse.json(
          { error: "coordinates_invalid" },
          { status: 400 },
        );
      }

      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(latitude));
      url.searchParams.set("longitude", String(longitude));
      url.searchParams.set("current", "temperature_2m");
      url.searchParams.set("timezone", "auto");
      url.searchParams.set("forecast_days", "1");
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        return NextResponse.json(
          { error: "coordinate_timezone_unavailable" },
          { status: 503 },
        );
      }
      const payload = await response.json() as { timezone?: string };
      if (!payload.timezone) {
        return NextResponse.json(
          { error: "coordinate_timezone_unavailable" },
          { status: 503 },
        );
      }
      try {
        new Intl.DateTimeFormat("en", { timeZone: payload.timezone }).format(0);
      } catch {
        return NextResponse.json(
          { error: "coordinate_timezone_invalid" },
          { status: 503 },
        );
      }
      return NextResponse.json({ timezone: payload.timezone });
    }

    if (level === "current") {
      const latitudeRaw = request.headers.get("x-vercel-ip-latitude")?.trim() ?? "";
      const longitudeRaw = request.headers.get("x-vercel-ip-longitude")?.trim() ?? "";
      const latitude = Number(latitudeRaw);
      const longitude = Number(longitudeRaw);
      const timezone = request.headers.get("x-vercel-ip-timezone")?.trim() ?? "";
      const encodedCity = request.headers.get("x-vercel-ip-city")?.trim() ?? "";
      const countryCode = request.headers.get("x-vercel-ip-country")?.trim() ?? "";

      if (
        !latitudeRaw ||
        !longitudeRaw ||
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180 ||
        !timezone
      ) {
        return NextResponse.json(
          { error: "approximate_location_unavailable" },
          { status: 503 },
        );
      }
      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone }).format(0);
      } catch {
        return NextResponse.json(
          { error: "approximate_location_unavailable" },
          { status: 503 },
        );
      }

      let city = encodedCity;
      try {
        city = decodeURIComponent(encodedCity);
      } catch {
        // Vercel normally RFC3986-encodes non-ASCII city names.
      }

      return NextResponse.json({
        place: {
          name: [city || "Approximate current location", countryCode]
            .filter(Boolean)
            .join(", "),
          latitude,
          longitude,
          timezone,
          approximate: true,
        },
      });
    }

    if (level === "country") {
      const payload = await readJson<Country[]>(
        `${API}/countries/flag/unicode`,
      );

      const countries = (payload.data ?? [])
        .map((item) => item.name?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b));

      if (countries.length === 0) {
        throw new Error("location_country_list_empty");
      }

      return NextResponse.json({ countries });
    }

    if (level === "state") {
      if (!country) {
        return NextResponse.json({ states: [] }, { status: 400 });
      }

      const states = await getStates(country);

      const countryKey = country.toLocaleLowerCase();
      const normalizedStates =
        countryKey === "sri lanka"
          ? SRI_LANKA_PROVINCES
          : countryKey === "philippines"
            ? PHILIPPINES_REGIONS
            : states
                .map((item) => item.name?.trim())
                .filter((name): name is string => Boolean(name));

      return NextResponse.json({
        states: [...new Set(normalizedStates)].sort((a, b) =>
          a.localeCompare(b),
        ),
      });
    }

    if (level === "city") {
      if (!country || !state) {
        return NextResponse.json({ cities: [] }, { status: 400 });
      }

      if (
        country.toLocaleLowerCase() === "philippines" &&
        PHILIPPINES_CITIES_BY_REGION[state]
      ) {
        return NextResponse.json({
          cities: [...PHILIPPINES_CITIES_BY_REGION[state]].sort((a, b) =>
            a.localeCompare(b),
          ),
        });
      }

      if (
        country.toLocaleLowerCase() === "sri lanka" &&
        SRI_LANKA_DISTRICTS_BY_PROVINCE[state]
      ) {
        const curatedCities = SRI_LANKA_CITIES_BY_PROVINCE[state] ?? [];
        return NextResponse.json({
          cities: [...new Set(curatedCities)].sort((a, b) => a.localeCompare(b)),
        });
      }

      const cities = await getCitiesForState(country, state);

      return NextResponse.json({
        cities: [...new Set(cities)].sort((a, b) => a.localeCompare(b)),
      });
    }

    return NextResponse.json(
      { error: "invalid_location_level" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "location_source_failed",
      },
      { status: 502 },
    );
  }
}
