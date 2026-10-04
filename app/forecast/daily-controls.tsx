"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { localDate } from "@/lib/daily/sky";

type Props = {
  charts: { id: string; name: string }[];
  selectedId: string;
  date?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  place?: string;
};

type SearchPlace = {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
};

type CurrentPlace = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  approximate?: boolean;
};

export default function DailyControls(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lat, setLat] = useState(props.latitude ?? "");
  const [lon, setLon] = useState(props.longitude ?? "");
  const [timezone, setTimezone] = useState(props.timezone ?? "");
  const [place, setPlace] = useState(props.place ?? "");
  const [locationNote, setLocationNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const locationRequest = useRef(0);

  function beginLocationRequest() {
    locationRequest.current += 1;
    return locationRequest.current;
  }

  const field =
    "mt-2 w-full rounded-xl border border-[#d7e5da] bg-white px-3 py-3 text-sm text-[#233e2e]";

  function setChosenLocation(
    nextPlace: string,
    latitude: number,
    longitude: number,
    nextTimezone: string,
    note = "",
  ) {
    setPlace(nextPlace.slice(0, 80));
    setLat(String(latitude));
    setLon(String(longitude));
    setTimezone(nextTimezone);
    setLocationNote(note);
    setError("");
  }

  async function loadApproximateCurrentLocation(requestId: number) {
    try {
      const response = await fetch("/api/locations?level=current", {
        cache: "no-store",
      });
      const payload = await response.json() as {
        place?: CurrentPlace;
        error?: string;
      };

      if (
        requestId !== locationRequest.current ||
        !response.ok ||
        !payload.place
      ) return false;

      setChosenLocation(
        payload.place.name || "වත්මන් ප්‍රදේශය",
        payload.place.latitude,
        payload.place.longitude,
        payload.place.timezone,
        "GPS location ලබාගත නොහැකි නිසා network මත පදනම් වූ ආසන්න නගර ස්ථානය භාවිත කරයි.",
      );
      return true;
    } catch {
      return false;
    }
  }

  function useCurrentLocation() {
    const requestId = beginLocationRequest();
    setError("");
    setSearchResults([]);
    setLocating(true);

    const fallback = async () => {
      const usedApproximate = await loadApproximateCurrentLocation(requestId);
      if (requestId !== locationRequest.current) return;
      if (!usedApproximate) {
        setError(
          "Current location ලබාගත නොහැකි විය. පහත Location Search භාවිත කර ස්ථානය තෝරන්න.",
        );
      }
      setLocating(false);
    };

    if (!navigator.geolocation) {
      void fallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (requestId !== locationRequest.current) return;
        try {
          const params = new URLSearchParams({
            level: "timezone",
            lat: String(position.coords.latitude),
            lon: String(position.coords.longitude),
          });
          const response = await fetch("/api/locations?" + params, {
            cache: "no-store",
          });
          const result = await response.json() as { timezone?: string };
          if (!response.ok || !result.timezone) {
            throw new Error("coordinate_timezone_unavailable");
          }
          if (requestId !== locationRequest.current) return;
          setChosenLocation(
            "මගේ වත්මන් ස්ථානය",
            position.coords.latitude,
            position.coords.longitude,
            result.timezone,
            "GPS coordinates අනුව ස්ථානයේ වේලා කලාපය තීරණය කරයි.",
          );
        } catch {
          if (requestId === locationRequest.current) {
            setError(
              "GPS ස්ථානයට ගැළපෙන වේලා කලාපය හඳුනාගත නොහැකි විය. Location Search මඟින් ස්ථානය තෝරන්න.",
            );
          }
        } finally {
          if (requestId === locationRequest.current) setLocating(false);
        }
      },
      () => {
        if (requestId !== locationRequest.current) return;
        void fallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 120000,
      },
    );
  }

  async function searchPlaces() {
    const query = searchQuery.trim();
    const requestId = beginLocationRequest();
    setError("");
    setSearchResults([]);
    setLocating(false);
    setSearching(false);

    if (query.length < 2) {
      setError("නගරය හෝ ප්‍රදේශය අවම වශයෙන් අකුරු 2කින් සොයන්න.");
      return;
    }

    setSearching(true);
    try {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.searchParams.set("name", query);
      url.searchParams.set("count", "8");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");

      const response = await fetch(url.toString(), { cache: "no-store" });
      if (requestId !== locationRequest.current) return;
      if (!response.ok) throw new Error("location_search_failed");

      const payload = await response.json() as { results?: SearchPlace[] };
      const results = (payload.results ?? []).filter((item) =>
        typeof item.name === "string" &&
        typeof item.latitude === "number" &&
        typeof item.longitude === "number" &&
        typeof item.timezone === "string"
      );

      if (results.length === 0) {
        setError(
          "ගැළපෙන ස්ථානයක් හමු නොවුණා. උදා: Kiryu, Gunma හෝ Kurunegala, Sri Lanka ලෙස සොයන්න.",
        );
        return;
      }

      setSearchResults(results);
    } catch {
      setError(
        "Location Search සේවාවට සම්බන්ධ විය නොහැකි විය. නැවත උත්සාහ කරන්න.",
      );
    } finally {
      if (requestId === locationRequest.current) setSearching(false);
    }
  }

  function chooseSearchResult(result: SearchPlace) {
    if (
      typeof result.name !== "string" ||
      typeof result.latitude !== "number" ||
      typeof result.longitude !== "number" ||
      typeof result.timezone !== "string"
    ) return;

    beginLocationRequest();
    setSearching(false);
    setLocating(false);
    const label = [result.name, result.admin1, result.country]
      .filter(Boolean)
      .join(", ");

    setChosenLocation(
      label,
      result.latitude,
      result.longitude,
      result.timezone,
      "Location Search මඟින් තෝරාගත් ස්ථානය.",
    );
    setSearchQuery(label);
    setSearchResults([]);
  }

  return (
    <form
      className="rounded-2xl border border-[#d7e5da] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        if (!lat.trim() || !lon.trim() || !timezone.trim()) {
          setError("Current Location හෝ Location Search මඟින් ස්ථානයක් තෝරන්න.");
          return;
        }

        const form = new FormData(event.currentTarget);
        let date = String(form.get("date") || "");

        try {
          if (!date) date = localDate(Date.now(), timezone);
          else new Intl.DateTimeFormat("en", { timeZone: timezone }).format(0);
        } catch {
          setError("තෝරාගත් ස්ථානයේ වේලා කලාපය නිවැරදි නොවේ.");
          return;
        }

        const query = new URLSearchParams({
          calculation: String(form.get("calculation")),
          date,
          lat,
          lon,
          tz: timezone,
          place: place.slice(0, 80),
        });

        startTransition(() => router.push("/forecast?" + query.toString()));
      }}
    >
      <label className="text-sm font-medium">
        කේන්දරය
        <select
          name="calculation"
          defaultValue={props.selectedId}
          className={field}
        >
          {props.charts.map((chart) => (
            <option key={chart.id} value={chart.id}>{chart.name}</option>
          ))}
        </select>
      </label>

      <section className="mt-4 rounded-xl border border-[#d7e5da] bg-[#f8fbf8] p-4">
        <h2 className="text-sm font-semibold text-[#233e2e]">
          අද සිටින ස්ථානය
        </h2>
        <button
          type="button"
          disabled={locating || searching || pending}
          onClick={useCurrentLocation}
          className="mt-3 w-full rounded-xl border border-[#b9d8c3] bg-[#edf5ef] px-4 py-3 text-sm font-semibold text-[#176b4a] disabled:opacity-60"
        >
          {locating ? "ස්ථානය හඳුනාගනිමින්…" : "⌖ Current Location"}
        </button>
        <p className="mt-2 text-xs leading-5 text-[#64786b]">
          GPS permission ලබාගත නොහැකි browser එකකදී app එක ආසන්න city-level
          network location එකක් භාවිත කිරීමට උත්සාහ කරයි.
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-[#d7e5da] bg-[#f8fbf8] p-4">
        <h2 className="text-sm font-semibold text-[#233e2e]">
          Location Search
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={searchQuery}
            onChange={(event) => {
              beginLocationRequest();
              setSearching(false);
              setLocating(false);
              setSearchQuery(event.target.value);
              setSearchResults([]);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void searchPlaces();
              }
            }}
            placeholder="Kiryu, Gunma / Kurunegala, Sri Lanka"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-[#d7e5da] bg-white px-3 py-3 text-sm text-[#233e2e]"
          />
          <button
            type="button"
            disabled={searching || locating || pending}
            onClick={() => void searchPlaces()}
            className="rounded-xl bg-[#176b4a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {searching ? "…" : "සොයන්න"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#d7e5da] bg-white">
            {searchResults.map((result, index) => {
              const label = [result.name, result.admin1, result.country]
                .filter(Boolean)
                .join(", ");
              return (
                <button
                  key={result.id ?? `${label}-${index}`}
                  type="button"
                  disabled={locating || searching || pending}
                  onClick={() => chooseSearchResult(result)}
                  className="block w-full border-b border-[#edf1ed] px-3 py-3 text-left last:border-b-0 hover:bg-[#f3f8f4]"
                >
                  <span className="block text-sm font-medium text-[#233e2e]">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-[#64786b]">
                    {result.timezone}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {place && (
        <div className="mt-4 rounded-xl border border-[#b9d8c3] bg-[#edf5ef] px-4 py-3">
          <p className="text-xs font-semibold text-[#176b4a]">
            තෝරාගත් ස්ථානය
          </p>
          <p className="mt-1 text-sm font-medium text-[#233e2e]">{place}</p>
          {locationNote && (
            <p className="mt-1 text-xs leading-5 text-[#64786b]">
              {locationNote}
            </p>
          )}
        </div>
      )}

      <label className="mt-4 block text-xs font-medium">
        දිනය
        <input
          name="date"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          defaultValue={props.date ?? ""}
          className={field}
        />
        <span className="mt-2 block text-[11px] leading-5 text-[#64786b]">
          හිස්ව තැබුවොත් තෝරාගත් ස්ථානයේ අද දිනය භාවිත කරයි.
        </span>
      </label>

      <p className="mt-4 text-xs leading-6 text-[#64786b]">
        මෙය උපන් ස්ථානය නොව, අද ඔබ සිටින ස්ථානයයි. තෝරාගත් current location
        එක chart/profile එකේ permanent field එකක් ලෙස save නොකර Daily request
        එක සඳහා පමණක් භාවිත කරයි.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}

      <button
        disabled={pending || locating || searching || !lat || !lon || !timezone}
        className="mt-4 w-full rounded-xl bg-[#176b4a] px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "දිනපතා කියවීම සකස් කරමින්…" : "☀ දිනපතා කියවීම බලන්න"}
      </button>

      <span role="status" className="sr-only">
        {pending || locating || searching ? "ගණනය වෙමින් පවතී" : ""}
      </span>
    </form>
  );
}
