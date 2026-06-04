# Content Gap Engine Architecture

## Overview
A backend deterministic engine that evaluates a creator's historical content mix against established growth heuristics to identify actionable posting gaps. 

## Rules Engine
The engine evaluates the following mathematical and categorical metrics:
1. **Cadence Issues:**
   - Detects `posting gap exceeds 30 days`.
   - Detects `inconsistent frequency` (e.g., standard deviation of days between posts > 7).
2. **Format Imbalance:**
   - Detects `format dominance` (e.g., "80% of content uses a single format").
   - Flags underused native formats (e.g., "0 Reels posted in the last 90 days").
3. **Topic Concentration:**
   - Detects `content pillar neglect` (e.g., Pillar B has 0 posts while Pillar A has 10).
   - Detects `repetitive topic fatigue` (e.g., 5 consecutive posts share the exact same AI-inferred topic).

## UI Integration
These deterministic findings are surfaced in the **Content Opportunities Panel** on the Creator Intelligence Dashboard. They are displayed as actionable alert cards, never masked as LLM-generated wisdom.
