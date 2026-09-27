# Visual QA

NipunAstro visual review no longer depends on a Vercel preview for every UI commit.

## What CI captures

The `Visual QA` workflow builds the Next.js app locally in GitHub Actions, starts it, and captures iPhone-sized screenshots for:

1. Splash
2. Welcome
3. Login
4. Dashboard theme fixture
5. New chart theme fixture
6. My charts theme fixture
7. Calculation theme fixture
8. Daśā theme fixture
9. Transit theme fixture
10. Prediction theme fixture
11. Profile theme fixture
12. Admin theme fixture

The screenshot set is uploaded as the `nipunastro-visual-qa` workflow artifact.

## Security boundary

`VISUAL_QA_MODE=1` is supplied only by CI. Fixture routes under `/visual-qa/*` return 404 when that variable is absent. They contain deterministic sample UI only and do not expose or mutate production user data.

## What this does not replace

Visual fixtures verify the shared visual language and Sinhala rendering. They do not replace authenticated end-to-end tests against Supabase. Vercel remains the milestone integration preview before merge/release.
