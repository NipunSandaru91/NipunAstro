"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { localDate } from "@/lib/daily/sky";

const QUICK_CITIES = [
  ["කොළඹ", 6.9271, 79.8612, "Asia/Colombo"],
  ["මහනුවර", 7.2906, 80.6337, "Asia/Colombo"],
  ["ගාල්ල", 6.0535, 80.221, "Asia/Colombo"],
  ["කිරියු", 36.4055, 139.3307, "Asia/Tokyo"],
  ["ටෝකියෝ", 35.6762, 139.6503, "Asia/Tokyo"],
  ["ඔසාකා", 34.6937, 135.5023, "Asia/Tokyo"],
  ["ලන්ඩන්", 51.5074, -0.1278, "Europe/London"],
  ["මෙල්බර්න්", -37.8136, 144.9631, "Australia/Melbourne"],
] as const;

type Props = {
  charts: { id: string; name: string }[];
  selectedId: string;
  date?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  place?: string;
};

type ResolvedPlace = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export default function DailyControls(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lat, setLat] = useState(props.latitude ?? "");
  const [lon, setLon] = useState(props.longitude ?? "");
  const [timezone, setTimezone] = useState(props.timezone ?? "");
  const [place, setPlace] = useState(props.place ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const field =
    "mt-2 w-full rounded-xl border border-[#d7e5da] bg-white px-3 py-3 text-sm text-[#233e2e]";

  function useCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("මෙම browser එකෙන් current location ලබාගත නොහැක.");
      return;
    }

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTimezone) {
      setError("Device වේලා කලාපය හඳුනාගත නොහැක.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude));
        setLon(String(position.coords.longitude));
        setTimezone(browserTimezone);
        setPlace("මගේ වත්මන් ස්ථානය");
        setLocating(false);
      },
      (geoError) => {
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location permission ලබා දී නැහැ. පහත නගරය/ප්‍රදේශය සොයා තෝරන්න.",
          );
          return;
        }
        setError(
          "Current location ලබාගත නොහැකි විය. නගරය/ප්‍රදේශය සොයා තෝරන්න.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function resolvePlace() {
    const query = searchQuery.trim();
    setError("");

    if (query.length < 2) {
      setError("නගරය හෝ ප්‍රදේශය අවම වශයෙන් අකුරු 2කින් සොයන්න.");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/locations?level=resolve&query=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );
      const payload = await response.json() as {
        place?: ResolvedPlace;
        error?: string;
      };

      if (!response.ok || !payload.place) {
        throw new Error(payload.error ?? "location_not_found");
      }

      const resolved = payload.place;
      setLat(String(resolved.latitude));
      setLon(String(resolved.longitude));
      setTimezone(resolved.timezone);
      setPlace(
        [resolved.name, resolved.country].filter(Boolean).join(", ").slice(0, 80),
      );
    } catch {
      setError(
        "එම ස්ථානය හඳුනාගත නොහැකි විය. නගරය, ප්‍රාන්තය/පළාත, රට සමඟ නැවත සොයන්න.",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <form
      className="rounded-2xl border border-[#d7e5da] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);
        let date = String(form.get("date") || "");

        if (!lat.trim() || !lon.trim() || !timezone.trim()) {
          setError("Current location හෝ නගරයක් තෝරන්න.");
          return;
        }

        try {
          if (!date) date = localDate(Date.now(), timezone);
          else new Intl.DateTimeFormat("en", { timeZone: timezone }).format(0);
        } catch {
          setError("නිවැරදි වේලා කලාපයක් තෝරන්න. උදා: Asia/Tokyo");
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          කේන්දරය
          <select
            name="calculation"
            defaultValue={props.selectedId}
            className={field}
          >
            {props.charts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="text-sm font-medium">
          අද සිටින ස්ථානය
          <button
            type="button"
            disabled={locating || pending}
            onClick={useCurrentLocation}
            className="mt-2 w-full rounded-xl border border-[#b9d8c3] bg-[#edf5ef] px-3 py-3 text-sm font-semibold text-[#176b4a] disabled:opacity-60"
          >
            {locating ? "ස්ථානය හඳුනාගනිමින්…" : "⌖ මගේ වත්මන් ස්ථානය"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#d7e5da] bg-[#f8fbf8] p-3">
        <label className="text-xs font-medium text-[#566c5e]">
          නගරය / ප්‍රදේශය තෝරන්න
          <div className="mt-2 flex gap-2">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void resolvePlace();
                }
              }}
              placeholder="උදා: Kiryu, Gunma, Japan"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-[#d7e5da] bg-white px-3 py-3 text-sm text-[#233e2e]"
            />
            <button
              type="button"
              disabled={searching || pending}
              onClick={() => void resolvePlace()}
              className="rounded-xl bg-[#176b4a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {searching ? "…" : "සොයන්න"}
            </button>
          </div>
        </label>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-[#176b4a]">
          ඉක්මන් නගර තේරීම්
        </summary>
        <select
          className={field}
          defaultValue=""
          onChange={(event) => {
            const city = QUICK_CITIES[Number(event.target.value)];
            if (event.target.value !== "" && city) {
              setPlace(city[0]);
              setLat(String(city[1]));
              setLon(String(city[2]));
              setTimezone(city[3]);
              setError("");
            }
          }}
        >
          <option value="">නගරයක් තෝරන්න</option>
          {QUICK_CITIES.map((c, i) => (
            <option value={i} key={c[0]}>{c[0]}</option>
          ))}
        </select>
      </details>

      <p className="mt-3 text-xs leading-6 text-[#64786b]">
        උපන් ස්ථානය නොව, අද ඔබ සිටින ස්ථානය භාවිත කරන්න. Current location
        තෝරන විට browser එක location permission ඉල්ලයි. Location එක ඔබේ
        කේන්දරයට හෝ app database එකට current-location field එකක් ලෙස save නොකර,
        මෙම Daily request එකේ coordinates ලෙස භාවිත කරයි.{" "}
        {place && `තෝරාගත් ස්ථානය: ${place}`}
      </p>

      <details className="mt-3" open={!lat || !lon || !timezone}>
        <summary className="cursor-pointer text-sm text-[#176b4a]">
          අතින් coordinates / දිනය වෙනස් කරන්න
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs">
            අක්ෂාංශ
            <input
              required
              type="number"
              min={-90}
              max={90}
              step="any"
              value={lat}
              onChange={(e) => {
                setLat(e.target.value);
                setPlace("තෝරාගත් ස්ථානය");
              }}
              className={field}
            />
          </label>
          <label className="text-xs">
            දේශාංශ
            <input
              required
              type="number"
              min={-180}
              max={180}
              step="any"
              value={lon}
              onChange={(e) => {
                setLon(e.target.value);
                setPlace("තෝරාගත් ස්ථානය");
              }}
              className={field}
            />
          </label>
          <label className="text-xs">
            වේලා කලාපය
            <input
              required
              value={timezone}
              placeholder="Asia/Tokyo"
              onChange={(e) => setTimezone(e.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            දිනය (හිස් නම් අද)
            <input
              name="date"
              type="date"
              min="1900-01-01"
              max="2100-12-31"
              defaultValue={props.date ?? ""}
              className={field}
            />
          </label>
        </div>
      </details>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>
      )}

      <button
        disabled={pending || locating || searching}
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
