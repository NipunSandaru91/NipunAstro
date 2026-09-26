# Pre-Prediction Quality Gate

Status: LOCKED FOR PREDICTION-LAYER ENTRY  
Scope: Calculation Foundation V1 -> Prediction Layer

## Purpose

The prediction layer must not be expanded until the deterministic calculation foundation and its application boundaries have explicit quality gates.

The foundation remains calculation-only. Prediction is a separate layer.

## Current verified baseline

### Calculation / regression

- Golden Chart regression exists.
- D1 / Rāśi calculation is covered.
- Bhāva V1 regression tests exist.
- Dṛṣṭi V1 regression tests exist.
- Ṣaḍbala V1 regression tests exist.
- Yoga V1 regression tests exist.
- Vimśottarī Daśā V1 regression tests exist.
- Transit V1 regression tests exist.
- GitHub Actions currently runs:
  `deno test --clean --allow-env --coverage=coverage --coverage-threshold=100 tests`

Important: the 100% threshold is a gate for the Deno `tests/` scope. It does NOT mean the entire Next.js application, server actions, authentication boundary, Edge Function orchestration, or UI has 100% coverage.

### Build

- Next.js production build is checked by GitHub Actions.
- Build workflow uses `npm ci` followed by `npm run build`.

## Prediction entry gates

Prediction development may expand only when the following are satisfied.

### Gate A — Deterministic calculation core

Required:

- [x] Existing calculation regression suite remains green.
- [x] Golden Chart remains regression-locked.
- [x] D1, Bhāva, Dṛṣṭi, Ṣaḍbala, Yoga, Daśā and Transit regression tests remain green.
- [x] Existing calculation test scope retains its 100% coverage threshold.

### Gate B — Server/application boundary

Required before prediction data is consumed by production UI:

- [ ] `createCalculation` server action has automated tests for:
  - input extraction
  - place-resolution failure
  - validation failure
  - RPC creation failure
  - missing session
  - calculator HTTP failure
  - successful handoff
- [ ] `calculateTransit` has automated tests for:
  - missing input
  - missing session
  - calculator HTTP failure
  - network/runtime failure
  - successful handoff
- [ ] Authentication boundary is explicitly tested.
- [ ] Calculation API / Edge Function contract is integration-tested.

### Gate C — Edge Function orchestration

Required:

- [ ] Request normalization and validation are independently tested.
- [ ] Authentication and ownership checks are tested.
- [ ] Natal calculation orchestration has integration coverage.
- [ ] Transit orchestration has integration coverage.
- [ ] Failure-stage reporting is tested.
- [ ] Persistence/materialization failures are tested.
- [ ] Calculation state transitions are tested.

The Edge Function should remain an orchestration layer. Calculation domain logic belongs in the tested core modules.

### Gate D — Critical UI smoke coverage

Required:

- [ ] Login/session boundary smoke test.
- [ ] Create-calculation flow smoke test.
- [ ] Calculation result page smoke test.
- [ ] Transit calculation flow smoke test.
- [ ] Error-state rendering smoke test.

### Gate E — Clean-code boundary

Required before substantial prediction implementation:

- [ ] Separate server action orchestration from domain calculation logic.
- [ ] Keep persistence concerns separate from calculation logic.
- [ ] Keep HTTP/auth concerns separate from deterministic calculation modules.
- [ ] Reduce repeated constants and shared type duplication.
- [ ] Progressively remove broad `any` usage from production orchestration code.
- [ ] Standardize error representation.
- [ ] Prediction engine remains a separate module from the calculation foundation.

## Prediction architecture contract

Prediction must follow:

**Rule -> Evidence -> Strength -> Supporting Factors -> Contradicting Factors -> Timing Activation -> Interpretation**

A prediction rule must be traceable to the calculation evidence that activated it.

No prediction rule may silently mutate or reinterpret the deterministic calculation foundation.

## Current status

| Area | Status | Prediction-entry interpretation |
|---|---|---|
| Calculation core | GREEN | Stable foundation |
| Golden Chart regression | GREEN | Locked regression |
| Calculation regression suite | GREEN | 100% threshold enforced for current Deno test scope |
| Build | GREEN | Production build checked |
| Server actions | AMBER | Additional automated boundary tests required |
| Auth boundary | AMBER | Explicit automated coverage required |
| Edge Function orchestration | AMBER | Integration coverage and responsibility separation required |
| Critical UI flows | AMBER | Smoke/E2E coverage required |
| Clean-code boundary | AMBER | Refactor before broad prediction expansion |
| Prediction engine | OFF | Must remain separate until gates are satisfied |

## Definition of done for Prediction Layer entry

Prediction Layer V1 can enter active implementation when:

1. Calculation regression remains green.
2. Current Deno calculation coverage gate remains 100%.
3. Server-action boundary tests exist.
4. Auth and calculation API/Edge Function integration tests exist.
5. Critical UI smoke coverage exists.
6. Edge Function orchestration has explicit integration coverage.
7. Prediction is implemented as a separate evidence-driven layer.

This document defines the quality boundary. It does not claim that all gates are currently complete.
