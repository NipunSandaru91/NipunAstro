# Daily card user-testing release

Replaces `/forecast` for Personal and Professional with **☀ අද ඔබට**.
Professional `/predictions` retains all time windows; calculation/role tables are unchanged.

## Contract

- Select an owned, calculated chart and current location, not an inferred birth location.
- Local civil date / IANA timezone; city presets or manual coordinates; 1900–2100.
- Concise overview, money, work, relationships, focus, symbolic numbers/colours,
  weekday good/Maru directions, actual-daylight Rahu period, all five Panchanga limbs.
- Sunrise-reference reading. At polar locations without sunrise, explicitly use local
  noon for the sky snapshot and do not fabricate sunrise or Rahu time.
- Existing deterministic V2 MD/AD and natal lord houses plus Moon transit house.
  This small editorial V1 is not a calibrated likelihood model, does not imply good
  outcomes from activation, and does not claim to interpret all five dasha levels.
- Numbers/colours are planetary symbolic associations for weekday lord and natal
  ascendant lord, not lottery recommendations. Directions are the basic Sri Lankan
  weekday convention, not full muhurta or physical-safety advice.
- Panchanga is a labelled snapshot, not an all-day claim. Limb transition times are
  not part of this version.

## Astronomy and security

New read-only `daily-sky` Edge Function uses the existing pinned Swiss WASM 0.1.5,
Moshier + Lahiri. Sun/Moon sidereal longitude drives tithi, nakshatra, yoga, karana.
Solar altitude uses Swiss apparent equatorial Sun + sidereal time, bisected at
-0.8333° for standard apparent upper-limb rise/set. Sea-level unobstructed horizon;
terrain, elevation and weather are not modeled. No external geocoder or new npm dependency.

The function validates user tokens through Supabase Auth **before** computing.
It takes no chart IDs and accesses no database/service-role key. The page reads
charts using the existing signed-in client and RLS-protected view/RPC, resolving
selection only among visible charts. No schema migration, natal/transit writes or
legacy-data deletion. Personal/Professional render the same daily product.

## Verification

- Pure unit tests: timezone/DST/date-line, input validation, angular/karana boundaries,
  all weekday Rahu eighths, polar events, chart-sensitive deterministic reading.
- Handler tests: signed-out/invalid token denied before calculation; unavailable auth,
  bad JSON/input, successful private response and ephemeris failure.
- `node scripts/daily-card-smoke.cjs`: synthetic SSR fixtures for both roles, all
  requested fields, empty/invalid location, non-owned query ID, failure and login gates.
- `deno run scripts/daily-sky-smoke.ts`: real pinned Swiss module regression fixtures.
  Reference values are captured engine outputs (regression, not independent astronomy).
- Full regression, coverage and build must pass CI before merge. Synthetic SSR is
  not a substitute for authenticated production-browser acceptance testing.

## Sources / methods

- Swiss API: https://www.astro.com/swisseph/swephprg.htm
- Pinned binding: https://jsr.io/@fusionstrings/swisseph-wasm/0.1.5
- Day directions (basic opposition convention, explicitly qualified):
  https://lankajhothisha.blogspot.com/2011/04/blog-post_17.html
- Sinhala Maru table corroboration, S. Siriwardana, 2019-03-23:
  https://www.lankadeepa.lk/sunday/rasawitha/ශුභ-මුහුර්ථයක්-හදා-ගන්නේ-මෙහෙමයි/57-547596
- Planetary numerology: https://astrology.astrosage.com/search?updated-max=2013-11-27T09%3A00%3A00%2B05%3A30&max-results=9&start=72&by-date=false
- Sunrise sanity reference: https://www.timeanddate.com/sun/sri-lanka/colombo?month=10&year=2026

## Rollback

Revert this web release to restore the previous forecast route; the existing engine
and databases are untouched. The isolated read-only daily-sky endpoint can remain
unused. Do not roll back Deep Dasha V2 or alter saved charts for a daily UI issue.
