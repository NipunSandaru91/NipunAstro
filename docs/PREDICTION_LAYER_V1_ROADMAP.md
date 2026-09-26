# Prediction Layer V1 Roadmap

Status legend: DONE / IN PROGRESS / TODO

## A. Foundation
- DONE — Typed PredictionEvidence contract
- DONE — Sinhala graha/rasi/bhava quality catalog
- DONE — Traceable source + rule metadata
- DONE — Qualitative evidence strength (WEAK/MODERATE/STRONG; not probability)

## B. Natal Rule Engine
- DONE — Bhava-lord placement derivation from Lagna + D1
- DONE — Placement modifiers: exaltation, own sign, debilitation, dusthana
- DONE — Drishti modifiers with Parashari aspect trace
- DONE — Shadbala modifier + versioned BPHS minimum thresholds
- DONE — Wire calculated Shadbala rows into natal rule evidence
- DONE — Yoga evidence adapter
- DONE — Lord relationships, conjunctions, and house occupancy\n- DONE — Career topic-specific natal combinations and evidence aggregation

## C. Topic Models
- DONE — Career / business natal evidence model\n- TODO — Career timing activation (Dasha + Transit)
- TODO — Education / knowledge
- TODO — Relationship / marriage
- TODO — Finance / wealth
- TODO — Health (careful, non-medical framing)
- TODO — Spirituality / dharma

## D. Timing Activation
- TODO — Vimshottari Dasha evidence adapter
- TODO — Transit evidence adapter
- TODO — Natal promise -> Dasha activation -> Transit trigger chain
- TODO — Timing contradiction/support aggregation

## E. Interpretation
- TODO — Structured conclusion object
- TODO — Sinhala interpretation renderer
- TODO — Supporting vs contradicting explanation
- TODO — No unsupported certainty / probability semantics

## F. Product/UI
- TODO — Prediction API/service boundary
- TODO — Topic cards
- TODO — expandable “මෙම ප්‍රතිඵලයට හේතුව” evidence UI
- TODO — timing UI
- TODO — source/version trace UI

## G. Quality Gate
- TODO — Golden Chart -> Golden Evidence regression
- TODO — Golden Prediction expectations
- TODO — full Deno regression + coverage gate
- TODO — Next.js build
- TODO — CI/Vercel green
- TODO — review + merge Prediction V1

## Current checkpoint
The engine can already derive a natal bhava-lord placement and enrich it with Sinhala qualities, placement dignity/house modifiers, Parashari drishti, and qualitative evidence balance. Shadbala is the active integration slice.
