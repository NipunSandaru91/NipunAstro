"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { localDate } from "@/lib/daily/sky";

const CITIES = [
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
export default function DailyControls(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lat, setLat] = useState(props.latitude ?? "");
  const [lon, setLon] = useState(props.longitude ?? "");
  const [timezone, setTimezone] = useState(props.timezone ?? "");
  const [place, setPlace] = useState(props.place ?? "");
  const [error, setError] = useState("");
  const field =
    "mt-2 w-full rounded-xl border border-[#d7e5da] bg-white px-3 py-3 text-sm text-[#233e2e]";
  return (
    <form
      className="rounded-2xl border border-[#d7e5da] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);
        let date = String(form.get("date") || "");
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
          කේන්දරය<select
            name="calculation"
            defaultValue={props.selectedId}
            className={field}
          >
            {props.charts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          අද සිටින ස්ථානය<select
            className={field}
            defaultValue=""
            onChange={(event) => {
              const city = CITIES[Number(event.target.value)];
              if (event.target.value !== "" && city) {
                setPlace(city[0]);
                setLat(String(city[1]));
                setLon(String(city[2]));
                setTimezone(city[3]);
              }
            }}
          >
            <option value="">නගරයක් තෝරන්න / පහත විස්තර යොදන්න</option>
            {CITIES.map((c, i) => <option value={i} key={c[0]}>{c[0]}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs leading-6 text-[#64786b]">
        උපන් ස්ථානය නොව, අද සිටින ස්ථානය තෝරන්න. GPS අවසර අවශ්‍ය නැහැ.{" "}
        {place && `තෝරාගත් ස්ථානය: ${place}`}
      </p>
      <details className="mt-3" open={!lat || !lon || !timezone}>
        <summary className="cursor-pointer text-sm text-[#176b4a]">
          ස්ථානය / දිනය වෙනස් කරන්න
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs">
            අක්ෂාංශ<input
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
            දේශාංශ<input
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
            වේලා කලාපය<input
              required
              value={timezone}
              placeholder="Asia/Tokyo"
              onChange={(e) => setTimezone(e.target.value)}
              className={field}
            />
          </label>
          <label className="text-xs">
            දිනය (හිස් නම් අද)<input
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
        disabled={pending}
        className="mt-4 w-full rounded-xl bg-[#176b4a] px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "දිනපතා කියවීම සකස් කරමින්…" : "☀ දිනපතා කියවීම බලන්න"}
      </button>
      <span role="status" className="sr-only">
        {pending ? "ගණනය වෙමින් පවතී" : ""}
      </span>
    </form>
  );
}
