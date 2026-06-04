# Auto-Onboarding Flow

## Goal
Replace the current manual onboarding-first experience with a frictionless flow driven by the new Instagram AI Intelligence pipeline.

## New Flow
```
1. Register
   ↓
2. Connect Instagram
   ↓
3. Analyze Instagram Content (Background processing via UI Status Card)
   ↓
4. Generate Creator DNA
   ↓
5. Review Generated Profile
   ↓
6. Edit Any Field (Full editorial control retained by user)
   ↓
7. Save Creator Profile
```

## Prefill Mechanism
When the `GET /api/instagram/intelligence` endpoint returns successfully (and `sourcePostCount >= 5`), the following form fields are pre-filled:
* Primary Niche
* Secondary Niches
* Content Pillars
* Tone
* Creator Stage
* Posting Style

## Strict Requirements
* **No Auto-Save:** Nothing is auto-saved to the database without the user explicitly reviewing and saving the form.
* **Full Editorial Control:** The user can modify any AI-inferred field.
* **Saving:** Submitting the form updates the `CreatorProfile` record via standard API calls.
