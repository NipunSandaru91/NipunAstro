"use client";

import { useEffect, useState } from "react";

type LocationSelectorProps = {
  name?: string;
};

export default function LocationSelector({
  name = "place_name",
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState("countries");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        const response = await fetch("/api/locations?level=country", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "country_list_failed");
        if (!cancelled) setCountries(payload.countries ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "country_list_failed");
        }
      } finally {
        if (!cancelled) setLoading("");
      }
    }

    loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!country) {
      setStates([]);
      setState("");
      setCities([]);
      setCity("");
      return;
    }

    let cancelled = false;
    setLoading("states");
    setError("");
    setStates([]);
    setState("");
    setCities([]);
    setCity("");

    fetch(`/api/locations?level=state&country=${encodeURIComponent(country)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "state_list_failed");
        if (!cancelled) setStates(payload.states ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "state_list_failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading("");
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      setCity("");
      return;
    }

    let cancelled = false;
    setLoading("cities");
    setError("");
    setCities([]);
    setCity("");

    fetch(
      `/api/locations?level=city&country=${encodeURIComponent(
        country,
      )}&state=${encodeURIComponent(state)}`,
      { cache: "no-store" },
    )
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "city_list_failed");
        if (!cancelled) setCities(payload.cities ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "city_list_failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading("");
      });

    return () => {
      cancelled = true;
    };
  }, [country, state]);

  return (
    <div className="sm:col-span-2 space-y-4">
      <SelectField
        label="Country"
        value={country}
        disabled={loading === "countries"}
        onChange={setCountry}
        options={countries}
        placeholder={loading === "countries" ? "Loading countries..." : "Select country"}
      />

      <SelectField
        label="Province / State"
        value={state}
        disabled={!country || loading === "states"}
        onChange={setState}
        options={states}
        placeholder={
          !country
            ? "Select country first"
            : loading === "states"
              ? "Loading provinces..."
              : "Select province / state"
        }
      />

      <SelectField
        label="City / Town"
        value={city}
        disabled={!state || loading === "cities"}
        onChange={setCity}
        options={cities}
        placeholder={
          !state
            ? "Select province / state first"
            : loading === "cities"
              ? "Loading cities..."
              : "Select city / town"
        }
      />

      <input type="hidden" name={name} value={city} />
      <input type="hidden" name="birth_country" value={country} />
      <input type="hidden" name="birth_state" value={state} />

      {error ? (
        <p className="text-xs leading-5 text-[#d8aaaa]">
          Location list could not be loaded: {error}
        </p>
      ) : (
        <p className="text-xs leading-5 text-[#676d76]">
          Select the location instead of typing it. This removes ordinary
          spelling and typo errors from the birth-place input.
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  disabled,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
        {label}
      </span>
      <select
        required
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[#343a43] bg-[#0d1014] px-3 py-3 text-sm text-[#d4cfc4] outline-none transition focus:border-[#8f7740] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
