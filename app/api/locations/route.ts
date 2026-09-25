import { NextRequest, NextResponse } from "next/server";

const API = "https://countriesnow.space/api/v0.1";

type Country = { name?: string };
type State = { name?: string; state_code?: string };
type ApiPayload<T> = { error?: boolean; msg?: string; data?: T };

async function readJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
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

export async function GET(request: NextRequest) {
  const level = request.nextUrl.searchParams.get("level");
  const country = request.nextUrl.searchParams.get("country")?.trim() ?? "";
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";

  try {
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

      const url = new URL(`${API}/countries/states/q`);
      url.searchParams.set("country", country);

      const payload = await readJson<{
        name?: string;
        iso2?: string;
        states?: State[];
      }>(url.toString());

      const states = (payload.data?.states ?? [])
        .map((item) => item.name?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b));

      return NextResponse.json({ states });
    }

    if (level === "city") {
      if (!country || !state) {
        return NextResponse.json({ cities: [] }, { status: 400 });
      }

      const url = new URL(`${API}/countries/state/cities/q`);
      url.searchParams.set("country", country);
      url.searchParams.set("state", state);

      const payload = await readJson<string[]>(url.toString());

      const cities = (payload.data ?? [])
        .map((name) => name.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      return NextResponse.json({ cities });
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
