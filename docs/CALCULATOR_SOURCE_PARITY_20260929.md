# Calculator source parity and failure ownership — 2026-09-29

The deployed platform version 45 was not the source in main `1eed3e7f`. Its entrypoint lacked `orchestration.ts` and its yoga mapping lacked the Sun and Moon own/exaltation entries. The other seven inspected files, including deno.json, matched main byte for byte apart from final newlines.

This change establishes an authenticated owner and PENDING/FAILED state before retaining a natal failure target. Error recording now uses that target and filters the update by owner, undeleted row and retryable status. It preserves existing metadata. Transit and unauthenticated failures do not alter natal status. Both modes exclude soft-deleted calculations; transit requires a CALCULATED chart. The encoded algorithm release label changes from `jyotisha-calculator/44` to `/45`. The Supabase platform deployment version is a separate counter.

Regression checks cover the owner guard, failure metadata, transit eligibility and Sun/Moon dignity mapping. Locally the targeted 27 Deno-style pure-function tests passed under Node's TypeScript stripping with a Deno.test shim. The complete Deno test/coverage and Next build run in repository CI. Do not infer live runtime success from local tests alone.

Release evidence to record after deployment:
- Git commit and successful CI.
- Supabase function platform version, JWT verification and full file parity with this commit.
- Anonymous and cross-owner denial on the function endpoint.
- Authenticated chart creation, calculated result, transit, failure/retry and deleted-chart behavior.
- UTC/JD and ascendant comparison against the two pinned birth fixtures.

This source update does not make multi-table persistence atomic. A mid-write failure may leave partial rows before the next successful retry; transactional persistence and concurrency checks remain separate work.
