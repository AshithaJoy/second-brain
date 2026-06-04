# Creator Intelligence UI Plan

## Objective
Design and implement the first user-facing Creator Intelligence experience powered entirely by real Instagram data and validated AI analysis. 

## Phase 1 — Intelligence Dashboard

### 1. Creator DNA Card
Visualizes the core identity inferred from content.
* **Fields:** Primary Niche, Secondary Niches, Content Pillars, Tone of Voice, Creator Stage, Posting Style.
* **Metrics:** 
  - Confidence Score (e.g., 87%)
  - Analyzed Posts Count (e.g., 25)
  - Generated Timestamp
* **Actions:** Allow future editing support.

### 2. Hook Intelligence Module
Highlights successful hook patterns.
* **Fields:** Top Hook Categories, Hook Frequency, Example Hooks, Recurring Structures.
* **Example Render:**
  - *Top Hook Type:* Personal Story
  - *Frequency:* 42%
  - *Example:* "I never thought this would happen..."
* **Constraint:** Uses only analyzed creator content. No hardcoded hooks or generated demos.

### 3. Content Opportunities Panel
Displays deterministic opportunities based on posting gaps and format mix.
* **Examples:** "Posting gap exceeds 90 days", "Educational content is underrepresented", "Reels are underutilized".
* **Constraint:** Generated from actual analytics. No generic AI advice.

### 4. Content Themes Map
Visualizes topics detected across posts.
* **Fields:** Top Topics, Emerging Topics, Underrepresented Topics.
* **Constraint:** Derived solely from `InstagramAIAnalysis` records. Must show confidence indicators.

## Phase 2 — Analysis Progress Experience
An Analysis Status Card that provides real-time feedback during the background sync and analysis process.
* **States:** 
  - Instagram Connected
  - Media Syncing
  - AI Analysis Running
  - Creator Intelligence Ready
* **Example UI Elements:** 
  - Progress bar (e.g., "15 / 25 posts analyzed (60%)")
  - Estimated Time Remaining.
  - Final Checkmarks for DNA, Hook Intelligence, and Opportunities.

## Empty State Rules
* If `sourcePostCount < 5`, immediately halt render of DNA insights, Opportunities, Hook intelligence, and Theme analysis.
* Display: *"Not enough Instagram content available to generate reliable intelligence."*
