# Content Gap Engine Specification

## Overview
The Content Gap Engine calculates deterministic opportunities based purely on mathematical analytics derived from the synced Instagram media. It explicitly avoids using the LLM for general advice or hallucinated recommendations.

## Deterministic Output Categories

### 1. Cadence Gaps
* **Trigger:** The difference in days between the `analyzedAt` timestamp and the most recent post's `timestamp`.
* **Output Example:** `⚠ Posting gap exceeds 90 days`

### 2. Content Gaps / Topic Concentration Risks
* **Trigger:** Analysis of the `contentPillar` field across the user's `InstagramAIAnalysis` records.
* **Output Example:** `⚠ 80% of content belongs to a single pillar` or `⚠ No educational content detected`

### 3. Format Gaps
* **Trigger:** Evaluation of the `mediaType` fields across recent posts.
* **Output Example:** `⚠ Reels represent less than 10% of content`

## Constraints
* Absolutely no generic AI recommendations (e.g. "Try posting more frequently!").
* Must only display facts mathematically derived from the database.
