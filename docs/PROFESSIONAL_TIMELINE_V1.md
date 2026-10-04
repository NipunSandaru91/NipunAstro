# Professional life-theme timeline — turning-window V2

Route `/timeline?calculation=<owned-id>`, linked from the dashboard. The route requires a verified session and `profiles.account_type = PROFESSIONAL` before chart access. It uses the existing signed-in/RLS view, chart RPC and deterministic Vimshottari engine. No database tables, migrations, writes, account changes or Edge deployment are needed.

## Selection and wording

1. Evaluate Mahadasha/Antardasha (MD/AD) windows against six broad life themes using natal house occupation and rulership links.
2. Rank linked MD/AD windows and shortlist at most ten distinct Antardashas for the past and at most ten for the future. The future horizon is ten fixed 365.25-day years. In-progress windows are omitted from both sides.
3. Within each shortlisted AD, retain completed past or complete future Pratyantardasha (PD) windows only when the PD lord also links to the same theme. MD, AD and PD must have three distinct lords. Return at most ten per side and at most two from one AD; do not pad when fewer qualify. Show results chronologically.
4. Explain the theme and label the direction as supportive, challenging or mixed. The label uses a simplified functional-house classification plus natural graha classification. The “evidence strength” label counts natal link matches; it is not a measure of life impact or probability.

Normal output contains MD → AD → PD. Sukshma and Prana are omitted. A past window is an astrological estimate, not a claim that an event happened. The model is not calibrated against reported events and does not include transits, yogas, aspects, dignity/strength, Moon phase, Mercury associations or birth-time uncertainty. Direction and evidence labels are heuristic and should be read as plain-language estimates, not fact.

Career and money themes require age 16; inner-change themes require age 12. Childhood periods in other themes are described as learning, family, or environment rather than adult relationship or job events.

## Golden example

The example uses the golden chart fixture: 1991-04-06 14:12 Asia/Colombo (08:42 UTC), Cancer ascendant, Moon 252.348067345° sidereal. Snapshot: 2026-10-04 13:00 UTC. Run `deno run scripts/timeline-golden.ts` to reproduce the JSON. The fixture currently yields ten past and ten future periods under the V2 rules; these are candidate windows, not validated turning points.

## Daily review

Daily findings 1–3 were addressed in merged PR #30 (location timezone, GPS/search race, and coordinate validation). Remaining disclosed limitations are that the daily sunrise snapshot lacks Panchanga transition times and personalized text has a small template vocabulary.

## Verification and release

Pure tests cover role gating, deterministic top-ten selection, three distinct topic-linked dasha lords, chronology, complete periods, age boundaries, no padding, and missing data. SSR smoke checks enforce auth/role before chart reads and confirm only three dasha levels appear. CI build, tests and coverage remain release gates. Rollback is a web PR revert; no data rollback is needed.
