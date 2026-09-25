"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e0b65b] text-[10px] font-bold text-[#15130e]">
          1
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b8954f]">
            Birthplace
          </p>
          <p className="text-[11px] text-[#778392]">
            Country → Province / State → City / Town
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <SearchableSelect
          label="Country"
          value={country}
          disabled={loading === "countries"}
          options={countries}
          placeholder={
            loading === "countries" ? "Loading countries..." : "Search country"
          }
          onChange={setCountry}
        />

        <SearchableSelect
          label="Province / State"
          value={state}
          disabled={!country || loading === "states"}
          options={states}
          placeholder={
            !country
              ? "Select country first"
              : loading === "states"
                ? "Loading provinces..."
                : "Search province / state"
          }
          onChange={setState}
        />

        <SearchableSelect
          label="City / Town"
          value={city}
          disabled={!state || loading === "cities"}
          options={cities}
          placeholder={
            !state
              ? "Select province / state first"
              : loading === "cities"
                ? "Loading cities..."
                : "Search city / town"
          }
          onChange={setCity}
        />
      </div>

      <input type="hidden" name={name} value={city} />
      <input type="hidden" name="birth_country" value={country} />
      <input type="hidden" name="birth_state" value={state} />

      {country && state && city ? (
        <div className="rounded-xl border border-[#405645] bg-[#0e1d17] px-3 py-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7fa98a]">
            Selected birthplace
          </p>
          <p className="mt-1 text-xs leading-5 text-[#d4cfc4]">
            {city}, {state}, {country}
          </p>
        </div>
      ) : (
        <p className="text-[10px] leading-5 text-[#687586]">
          Search and select each level from the list. Exact spelling is not required.
        </p>
      )}

      {error ? (
        <p className="text-xs leading-5 text-[#d8aaaa]">
          Location list could not be loaded: {error}
        </p>
      ) : null}
    </div>
  );
function normalizeLocationText(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function SearchableSelect({
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
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeLocationText(query);

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeLocationText(option).includes(normalizedQuery),
    );
  }, [options, query]);

  function selectOption(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    setOpen(true);

    const normalizedValue = normalizeLocationText(nextValue);
    if (!normalizedValue) {
      onChange("");
      return;
    }

    const exactMatch = options.find(
      (option) => normalizeLocationText(option) === normalizedValue,
    );

    if (exactMatch) {
      onChange(exactMatch);
    } else if (value) {
      onChange("");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const normalizedValue = normalizeLocationText(query);
    const exactMatch = options.find(
      (option) => normalizeLocationText(option) === normalizedValue,
    );

    if (exactMatch) {
      selectOption(exactMatch);
      return;
    }

    if (filteredOptions.length === 1) {
      selectOption(filteredOptions[0]);
      return;
    }

    setOpen(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#676d76]">
        {label}
      </span>

      <div className="relative">
        <input
          type="text"
          required
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-[#34475b] bg-[#0a1724] px-3 py-3.5 pr-10 text-sm text-[#d4cfc4] outline-none transition focus:border-[#b8954f] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#676d76]"
        >
          {open ? "⌃" : "⌄"}
        </span>
      </div>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#34475b] bg-[#0a1724] py-1 shadow-2xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                className="block w-full px-3 py-2.5 text-left text-sm text-[#d4cfc4] transition hover:bg-[#181d24] focus:bg-[#181d24] focus:outline-none"
              >
                {option}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-[#676d76]">
              No matching locations found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
