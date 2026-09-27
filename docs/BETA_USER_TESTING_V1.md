# NIPUN ASTRO — Beta User Testing V1

## Release candidate

Target branch: `beta/user-testing-v1`

This beta validates the integrated reference UI and the first end-to-end prediction layer together. It is not a production launch.

## Tester flow

1. Open the app and verify Splash → Welcome → Login.
2. Sign in with Google.
3. Create a new chart with a subject name, birth date, birth time and birth place.
4. Confirm My Charts uses the subject name as the chart title.
5. Open Chart Overview and verify the natal chart data loads.
6. Open Daśā Analysis and verify:
   - Mahādaśā start/end
   - Current Mahādaśā
   - Antardaśā start/end
   - Current Antardaśā
   - Remaining time and progress
7. Open Transit Analysis:
   - calculate a snapshot
   - verify rāśi, degree, retrograde state and natal bhāva
   - verify natal contacts and timing labels
8. Open Predictions and test all topics:
   - Career
   - Education
   - Relationship
   - Finance
   - Wellbeing
   - Spirituality
9. For each topic, inspect:
   - natal evidence
   - current Daśā + Transit timing
   - Daily / Weekly / Monthly / Yearly windows
10. Open Profile and verify navigation back to Dashboard.

## Must-report defects

Report any of the following as blockers:

- Login or redirect loop.
- A user can see another user's chart.
- New chart creation fails for valid input.
- Sinhala characters or පිල්ලම් render incorrectly.
- D1 / Daśā / Transit values change unexpectedly for the same saved chart.
- A prediction displays ACTIVE/STRONG when required timing data is missing.
- Daily / Weekly / Monthly / Yearly window generation fails.
- Mobile layout hides buttons, fields, or navigation.
- A crash, blank screen, or unhandled server error.

## Report format

- Screen:
- Device/browser:
- Steps:
- Expected:
- Actual:
- Screenshot:
- Chart ID if relevant:
- Date/time if relevant:

## Known beta constraints

- Prediction V1 is a rule/evidence system, not a probability score.
- Wellbeing is non-diagnostic and must not be treated as medical advice.
- Forecast windows are sampled timing windows, not continuous-event guarantees.
- Vercel preview may be unavailable while the account is deployment-rate-limited; beta preview can use the alternate test host.
