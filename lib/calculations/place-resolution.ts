export type ResolvedPlace = {
  query: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type GeocodingResult = {
  name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  feature_code?: string;
  population?: number;
};

function isUsablePlace(item: GeocodingResult): item is GeocodingResult & {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
} {
  return (
    typeof item.name === "string" &&
    typeof item.latitude === "number" &&
    typeof item.longitude === "number" &&
    typeof item.timezone === "string" &&
    typeof item.country === "string"
  );
}

function rankPlace(item: GeocodingResult, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const normalizedName = (item.name ?? "").trim().toLocaleLowerCase();
  const featureCode = item.feature_code ?? "";

  let score = 0;

  if (normalizedName === normalizedQuery) score += 100;
  if (featureCode === "PPLC") score += 30;
  if (featureCode.startsWith("PPLA")) score += 20;
  if (featureCode === "PPL") score += 10;
  if (typeof item.population === "number") {
    score += Math.min(Math.log10(Math.max(item.population, 1)), 8);
  }

  return score;
}

async function geocode(query: string): Promise<GeocodingResult[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NipunAstro/1.0",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`place_geocoding_http_${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: GeocodingResult[];
  };

  return payload.results ?? [];
}

export async function resolveBirthPlace(query: string): Promise<ResolvedPlace> {
  const value = query.trim();
  if (value.length < 2) throw new Error("birth_place_too_short");

  // First try the complete user input. This supports inputs such as
  // "Kiryu, Gunma, Japan" without requiring a separate location database.
  let results = await geocode(value);

  // If the complete phrase is not found, retry the final city/town token.
  // This keeps the existing Open-Meteo architecture tolerant of inputs such
  // as "Kiryu City, Gunma" or "Colombo, Sri Lanka".
  if (results.filter(isUsablePlace).length === 0) {
    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const cityCandidate = parts[0] ?? value;

    if (cityCandidate !== value) {
      results = await geocode(cityCandidate);
    }
  }

  const candidates = results.filter(isUsablePlace);

  if (candidates.length === 0) {
    throw new Error("birth_place_not_found");
  }

  const place = [...candidates].sort(
    (a, b) => rankPlace(b, value) - rankPlace(a, value),
  )[0];

  return {
    query: value,
    name: place.name,
    country: place.country,
    countryCode: place.country_code ?? "",
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
}
