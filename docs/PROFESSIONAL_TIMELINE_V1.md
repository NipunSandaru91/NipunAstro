# Professional life-theme timeline — experimental V1

Route `/timeline?calculation=<owned-id>`, linked from the Professional Dasha screen.
Fail-closed verified-session + profiles.account_type gate before chart access. Uses
existing signed-in/RLS view, chart RPC and deterministic V2 engine. No new database
tables, migrations, writes, account changes or Edge deployment.

## Selection (not a likelihood model)

At request time, choose up to 10 completed past PD windows since birth and up to
10 future **complete** PD windows over the next 10 fixed 365.25-day years. Exclude
the in-progress PD from both lists. Each candidate needs at least two distinct
MD/AD/PD lords with natal placement or rulership links to the topic's houses.
Editorial ranking weights MD/AD/PD = 3/2/1. Higher rank is not greater statistical
event probability or favourable fortune. One topic per PD, two cards per AD, four
per topic and two per each of five equal chronological bands avoid flooding the
result with repetitive periods. Ties are stable. Display final selection chronologically.
Do not pad when constraints yield fewer than 10. Golden case yields past 10/future 9.

Sukshma and Prana are actual nested V2 periods: choose a linked lord first, then
earliest start. They are representative drilldown windows, **not predicted event
times**. Whole parent chains and evidence are shown. Do not call the past list
confirmed events or solicit agreement with an assertion; use neutral questions.
Career/money require age 16; inner reflection age 12; childhood other themes remain
family/learning/environment descriptions, never marriage or job predictions.

This V1 intentionally does not aggregate transits, yoga, aspects, strength, unknown
birth-time uncertainty, or empirical event calibration. It is a reviewable starting
point, not the proposed final highest-impact-event predictor. Improve interpretations
and validate real-life feedback before paid Personal access. Personal access remains denied.

## Golden example

1991-04-06 14:12 Colombo = 08:42 UTC; Cancer ascendant;
Moon 252.348067345° from existing golden-chart regression fixture. All nine positions
match that fixture. Snapshot: 2026-10-04 13:00 UTC. Run
`deno run scripts/timeline-golden.ts` to reproduce the complete JSON example.
`timeline-golden-example.md` presents it in Asia/Colombo local time.

## Daily review, c2057d7 (#28)

Verified merged PRs #26–28, all three #28 CI checks and successful main Vercel status.
This is repository/deployment review, not a signed-in mobile acceptance test.
Remaining findings (not silently fixed as part of the timeline feature):

1. GPS uses device timezone; coordinates and zone can disagree when device time
   settings are manual or stale. Resolve the coordinate timezone or require confirmation.
2. GPS/search/fallback can race; a late GPS/network result can replace a deliberately
   selected city. Use request generation tokens/cancellation and unified busy controls.
3. `/api/locations?level=current` converts missing coordinate headers with Number(null)
   to 0. Require raw nonempty headers and valid geographic ranges before accepting.
4. Daily sunrise snapshot has no Panchanga transition times, and personalized text
   currently has a small template vocabulary. These disclosed limitations remain.

## Verification and release

Pure tests cover deterministic selection, chronology, disjoint history/future,
birth clipping, five-level nesting, missing data and role policy. Synthetic SSR
checks enforce auth/role before chart reads and safe chart selection. CI build and
full tests/100% coverage are required. No production timeline activation until this
experimental output has been reviewed. Rollback: revert web PR; no data rollback needed.
