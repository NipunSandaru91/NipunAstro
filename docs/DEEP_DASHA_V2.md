# Deep Dasha Engine V2 checkpoint

Branch: `feature/life-timeline-daily-astro-v1`. Status: engine and additive storage ready for review; not deployed or wired into the live calculator/UI.

## Contract

- `core/deep-dasha.ts` exports pure `generateDeepVimshottari`.
- Fixed 365.25-day years, UTC integer-millisecond boundaries, half-open `[start_at,end_at)` intervals. Resolve historical timezone before calling it.
- Input birth timestamp is canonical UTC ISO including milliseconds, AD year 0001–9999. Moon accepts one signed revolution [-360,360] and normalizes to [0,360).
- Depth 1–5 = MD → AD → PD → Sūkṣma → Prāṇa. Default depth 3; maximum 18 MDs, default 9. MD count includes the birth MD (even when its rounded remainder is empty).
- Every child starts with its parent's lord and follows the nine-lord rotation. Cumulative boundaries are rounded once at each parent split; adjacent children share endpoints. Millisecond precision is a numerical convention, not a claim of predictive accuracy.
- Split the full pre-birth parent first, then clip intervals at birth. Never subdivide the remaining balance as if it were a new full period.
- Rows carry deterministic path, parent path, level, sibling order, graha ID, timestamps, duration in milliseconds, and `VIMSHOTTARI_365.250_V2`. Identity is scoped to calculation/version/path.

## Mapping defect found during read-only inspection

The V1 TypeScript sequence and live `dasha_sequence_lords` associate ID 7 with 20 years and ID 6 with 19 years. The actual graha catalog and natal positions identify **6=SHUKRA/Venus** and **7=SHANI/Saturn**. V2 explicitly uses `[9,6,1,2,3,8,5,7,4]` with years `[7,20,6,10,7,18,16,19,17]`.

V1 exports, sequence records, saved birth state, MD/AD/PD tables and the existing RPC are unchanged. Do not relabel legacy rows as V2 or silently reinterpret their graha IDs. A reviewed migration/recalculation policy and comparison on saved charts are required before rollout. V2 derives directly from saved UTC and Moon longitude, avoiding the affected legacy birth-lord field.

The live `generate_vimshottari_periods` already generates PD as well as MD/AD. Its source was inspected read-only; the older handoff understated this scope.

## Database changes

`20261003163837_deep_vimshottari_v2.sql` adds:

- Pure SQL `deep_vimshottari_rows_v2` with the same precision and order contract.
- `deep_dasha_periods_v2` with versioned composite identity, same-calculation parent FK, positive duration checks, parent/lookup indexes and owner-only RLS reads excluding deleted charts.
- Service-role-only, security-invoker `generate_deep_vimshottari_v2`. It locks an existing non-deleted CALCULATED run, reads its stored Moon/UTC, and atomically replaces V2 rows. Missing/duplicate Moon, missing run, invalid parameters or failed insert roll back the operation. No new public writer.

No migration was applied to production. No Edge function was deployed. Default depth 3 limits ordinary generation; large multi-MD depth-5 persistence still needs staging load/concurrency testing before enabling it for users.

## Verification

TDD: new TypeScript tests failed before module creation; SQL parity tests failed before function creation; input-hardening tests failed before validation changes.

- Full Deno suite: 198 passed; 100% branch/function/line coverage across included tested modules, including `deep-dasha.ts`. This is not whole-app coverage.
- SQL/TS parity: 89,966 complete rows across five fixtures, including 66,429 rows covering a full nine-MD five-level hierarchy, the golden Moon, negative longitude normalization, a pre-epoch birth a near-360 boundary and a year-9999 birth. SQL timestamps are also checked for exact millisecond precision, avoiding float-second conversion drift.
- Golden birth: 1991-04-06 08:42 UTC, Moon 252.348067345032°. Ketu ends 1991-10-12T07:02:30.725Z; birth AD is Mercury. Timestamp independently checked using Python Decimal arithmetic. This is a regression fixture, not independent ephemeris revalidation.
- Local PGlite/Postgres: full-depth storage, regeneration idempotence, atomic rollback, owner/non-owner visibility, deleted and pending runs, missing Moon/run, anonymous denial and authenticated write denial.
- `npx next build --webpack` passed. Standard Turbopack build could not bind its worker port in this execution environment; the standard Build workflow remains a PR gate.
- Local DB tests use a minimal schema contract, not a full production restore. No claim of production migration rehearsal or authenticated UI E2E.

Commands:

```sh
deno test --clean --allow-env --coverage=coverage --coverage-threshold=100 tests
npm ci --prefix tests/database
npm test --prefix tests/database # Node 24
npx next build --webpack
```

Use a writable `DENO_DIR` if the runtime reports missing transpiled source while generating coverage. `deno.lock` pins the currently resolved test dependencies. The new database CI job installs only its separate locked test dependency.

## Next gate

1. Review the V1 Venus/Saturn discrepancy and approve an explicit legacy reconciliation policy.
2. Rehearse additive migration against a disposable full-schema staging clone; verify actual grants/RLS, concurrent regeneration, and depth-5 load. Do not replay the incomplete historical migrations blindly.
3. Integrate V2 through an explicitly versioned calculator/read contract after those gates. Preserve V1 MD/AD consumers until comparison passes.
4. Then build PredictionWindow and Professional timeline, followed by daily layer and access gating. Keep qualitative strength/direction/domain/event-character evidence separate from deterministic timing; do not retrofit holdout labels.
