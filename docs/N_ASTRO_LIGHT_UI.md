# N Astro — light UI proposal

## Direction

- Name: **N Astro**. Mark: a white N on a green square, with one small accent dot. The wordmark remains text so Sinhala interface copy is never baked into artwork.
- Base: white `#FFFFFF`; page: `#F7FAF7`; primary green `#176B4A`; soft green `#E8F4EC`; text `#18372A`; border `#D7E5DA`.
- Use color for actions, selected states and status. Keep calculations and interpretations in separate sections. Avoid decorative zodiac rings, glitter, gradients and fake progress claims.
- Sinhala copy remains live Unicode text. Existing calculation, location, RLS and interpretation rules are unchanged.

## Screen hierarchy

1. Entry: one statement and one next action.
2. Welcome: three factual steps (birth input, computation, reading).
3. Login: Google sign-in and Personal / Professional selection; no disabled provider buttons.
4. Dashboard: selected chart, its actual status, main reading actions, saved-chart count and settings.
5. Chart and analysis routes: light paper-like surfaces, green navigation and accessible contrast.

## Review gates

- Inspect at 390 px mobile width and desktop width, including all 12 Personal cards, D1, Daśā, Transit, Prediction, Admin and Settings.
- Verify Sinhala shaping/diacritics with real device fonts.
- Confirm Google login → chart creation → reading → transit → reopen → sign-out using a real authenticated account.
- Verify owner isolation and failure/retry paths before calling the release complete.

This is a source prototype. It has a successful local Next build and changed-file lint; live preview and authenticated E2E require a remote branch and a signed-in browser session.
