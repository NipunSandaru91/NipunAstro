export type ResolvedPlace = {
  query: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export async function resolveBirthPlace(query: string): Promise<ResolvedPlace> {
  const value = query.trim();
  if (value.length < 2) throw new Error("birth_place_too_short");

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", value);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`place_geocoding_http_${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      name?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
      country?: string;
      country_code?: string;
      feature_code?: string;
    }>;
  };

  const candidates = (payload.results ?? []).filter(
    (item) =>
      typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      typeof item.timezone === "string" &&
      typeof item.country === "string",
  );

  if (candidates.length === 0) {
    throw new Error("birth_place_not_found");
  }

  const place = candidates[0];

  return {
    query: value,
    name: place.name ?? value,
    country: place.country!,
    countryCode: place.country_code ?? "",
    latitude: place.latitude!,
    longitude: place.longitude!,
    timezone: place.timezone!,
  };
}
