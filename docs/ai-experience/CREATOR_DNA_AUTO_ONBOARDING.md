# Creator DNA Auto-Onboarding

## Concept
Automatically pre-fill the user's manual onboarding wizard using the generated Creator DNA, accelerating their setup process while preserving manual override capabilities.

## Workflow
1. **Trigger:** The user successfully connects Instagram and the background analysis completes.
2. **Fetch:** Frontend calls `GET /api/instagram/intelligence`.
3. **Form Pre-fill:** The Onboarding Form state is pre-populated:
   * "What is your primary niche?" -> Pre-filled with `primaryNiche`
   * "Describe your tone" -> Pre-filled with `toneOfVoice`
   * "Select your core content pillars" -> Pre-filled with `contentPillars`
4. **User Review:** The user is presented with the inferred data. A prominent badge indicates "AI Inferred from Instagram Data".
5. **Modification:** The user can edit any inferred field before saving.
6. **Save:** Standard `POST /api/profile` saves the final state to the `CreatorProfile` table.

## Edge Cases
* **Not Enough Data:** If `confidenceScore` is too low or post count < 5, the form remains blank and does not attempt to pre-fill.
