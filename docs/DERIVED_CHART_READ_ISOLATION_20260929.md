# Derived chart read isolation — 2026-09-29

## Problem and fix
Derived chart tables were incorrectly using the shared-reference SELECT policy. This allowed signed-in callers to read child records outside their own calculations. Migration `20260929093457_restrict_derived_chart_reads_to_owner_v1.sql` replaces those policies on 19 tables with owner or visible-parent checks. Shared astronomical reference catalogs and all stored chart data are unchanged.

## Deployment
Applied to the live database on 2026-09-29 through the migration API. This commit records the exact applied migration version; do not replay it against a database where that version is already recorded. The earlier six repository migration timestamps differ from their live counterparts, so reconcile migration history before using a blanket database push.

## Verification
The attached read-only SQL regression script passed against the updated database. An outsider identity saw zero rows on all 19 affected tables. An existing owner retained 162 antardasa and 1,452 pratyantardasa rows, matching the privileged ownership-filtered expected counts. Other affected tables had no rows for that selected owner, so positive fixture coverage for those tables remains pending. Anonymous schema access was denied. No authentication records or chart rows were created, deleted or changed by these checks.

These are database role/RLS checks, not a two-account HTTP or browser E2E test. The test script requires an administrative database connection and existing owned fixtures; it is not added to the Deno unit-test command.

## Remaining release gates
- Reconcile deployed Edge source with repository source before redeployment.
- Complete fresh authenticated login → create → view → reopen → logout checks.
- Review remaining security-advisor notices and RPC boundaries independently.
- Capture the complete base schema and test restoration; beta migrations alone are insufficient.

## References
- https://supabase.com/docs/guides/database/postgres/row-level-security
