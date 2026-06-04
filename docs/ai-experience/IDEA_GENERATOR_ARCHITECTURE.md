# Idea Generator Architecture (Phase 2)

## Goal
A user-facing AI prompt tool that generates actionable content ideas specifically tuned to the creator's historical success, leveraging the foundational intelligence data gathered in Phase 1.

## Inputs (Context)
When generating ideas, the system injects the following validated data into the LLM prompt:
1. `CreatorIntelligence`: The creator's niche, tone, and pillars.
2. `HookLibrary`: The creator's top 3 performing hook formats.
3. `CreatorOpportunity`: Identified content gaps.

## Outputs
Generates raw post ideas, broken down by format:
* Reel Ideas
* Carousel Ideas
* Story Ideas
* Hook Suggestions

## Strict Constraints
* **No Full Caption Generation:** The generator must only output outlines, hooks, and conceptual ideas. It deliberately stops short of full script/caption generation to keep the focus on strategic ideation rather than automated spam creation.
* **Traceability:** Every generated idea must visually reference which part of the Creator DNA or Hook Library inspired it.
