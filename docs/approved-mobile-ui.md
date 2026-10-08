# Approved mobile UI implementation

2026-10-08. Based on the four-screen white/forest-green N Astro mockup approved in conversation. Base: main `d9546ded87eca02702a25142e674b64e190dbf5b`.

- Personal dashboard prioritizes අද ඔබට, then the completed chart and new-chart action.
- Professional dashboard prioritizes the existing timeline, with D1, dasha, transit and daily shortcuts. Reading opens the actual predictions tab.
- Shared navigation has Home, Charts and Settings. The menu retains creation, daily, profile, Professional destinations, Admin (role gated) and sign-out. The existing approved logo is retained.
- Personal chart uses the existing calculated D1 renderer in compact mode; the decorative mockup's invented placements and alternate chart geometry are not copied. Name/relationship editors expand on demand and stay open for save/error feedback.
- Character and prediction topics share a horizontal selector. D1 and dasha/antardasha are explicit reading modes.
- Timeline switches between the existing past and future results, defaults to future, retains full evidence, and only displays the three existing timing levels. The level labels are explanatory rather than fake filters.
- Dashboard actions select the newest CALCULATED chart, skipping pending/failed records; all saved records remain accessible.
- Account type stays read-only. No calculation engine, migration, authorization rule, prediction content or production configuration changes.

## Verification

- `npm run build`: passed, including TypeScript and route compilation.
- Targeted ESLint for all changed TS/TSX components: passed.
- `node scripts/timeline-ssr-smoke.cjs`: passed. Covers signed-out and Personal denial before chart reads, owned chart selection, three-level output, empty state. Loader now resolves `.tsx` as well as `.ts`.
- Synthetic server rendering of real Personal/Professional dashboards and timeline: passed, including newest-pending/older-completed action selection.
- `git diff --check`: passed.
- Browser screenshot/interaction validation is pending: Playwright Chromium installation failed because the downloaded archives were truncated. No visual pass or live authenticated E2E is claimed.

## Review before release

Check 320/390px and desktop layouts, Sinhala glyph shaping, long names, safe-area navigation, keyboard/menu use, topic and time-range switching, empty/error states, and real authenticated links with both account types. Verify approved logo size in Safari and Chrome. Changes remain on the review branch until these checks and review pass.
