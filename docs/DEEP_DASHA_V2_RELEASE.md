# Deep Dasha V2 beta activation — 2026-10-04

## Scope

Professional chart → Daśā now offers MD → AD → PD → Sūkṣma → Prāṇa navigation, a current five-lord chain, breadcrumbs, and local-time boundaries. Personal current/upcoming readings and Professional prediction/forecast windows now consume V2 MD/AD identities through a shared adapter. Existing interpretation rules are unchanged. Event-strength calibration and a new daily-astrology product are not claimed in this release.

The server derives periods from each owned, non-deleted CALCULATED chart's stored UTC birth time and Moon longitude using the pure V2 engine. This covers existing and newly calculated charts without reading mislabeled legacy periods. Missing inputs produce unavailable timing; query failures are not replaced with fabricated readings. Deep navigation remains Professional-only, failing closed when the profile is missing. Existing account administration is unchanged.

## Reconciliation and database release

- 49 active calculated charts had valid UTC and one valid Moon row.
- Read-only comparison covered 8,510 MD/AD rows. All 49 charts contained changed lord IDs; 5,507 rows differed. Three charts differed by more than 1 ms at a boundary; maximum difference was about 2.166 ms. This comparison is not a forecast-validation exercise.
- The additive migration passed an actual-schema transaction rehearsal, including five-level generation, parent containment and privilege assertions, and was rolled back. No healthy hosted staging branch existed; this was **not** a full-schema staging clone or concurrency/load rehearsal.
- Applied production migration `20261004004322_deep_vimshottari_v2`; repository filename aligned with that version.
- Materialized 76,986 MD/AD/PD rows for 49 existing charts, in the V2 table only. All legacy sequence/birth/period rows remain unchanged and recoverable. These are versioned snapshots; live UI derives from canonical chart inputs and does not rely on snapshot freshness.
- Verified RLS enabled, anonymous reads denied, authenticated writes/materializer execution denied, and authenticated owner-read row counts against an independently computed ownership count.
- No ephemeris/Edge deployment, OAuth change, account-type change or destructive data migration.

## Verification and remaining limitations

Production Next.js build and changed-file lint passed locally. Ten focused engine/view tests passed. Database tests passed SQL/TS parity across 89,966 periods, all-level materialization, rollback/idempotence and access boundaries. Full tests/coverage and database/build checks are required in PR CI before merge; local full-suite dependency fetch was unavailable in this resumed environment.

Public browser verification reached the app and confirmed unauthenticated `/dashboard` redirects to login. The browser has no signed-in test session: authenticated mobile/desktop visual QA and user journey are not claimed. Test the first beta using an existing Professional account and its own chart. Do not change roles to bypass testing access.

The Supabase advisor still reports pre-existing mutable-search-path warnings in unrelated legacy functions. New V2 functions explicitly set `search_path=pg_catalog`; no new V2 advisor findings were observed. Track legacy remediation separately rather than rewriting unrelated production functions in this release.

## Rollback

Revert the web activation commit to restore legacy reads if user testing identifies a regression. Keep the additive V2 table/functions and old data for diagnosis; no automatic destructive rollback or legacy relabeling. Disable/revert the Professional deep route together with the V2 reading adapters so users are not shown mixed engine versions.
