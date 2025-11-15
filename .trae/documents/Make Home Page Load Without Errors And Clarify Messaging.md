## Diagnosis
- The home page shows “Failed to load templates. Please check your connection and try again.” because Supabase requests are disabled or failing.
- We already gated queries and added fallback template items, but categories filter may be missing and the error copy is generic.

## Plan
1. Clarify error messaging based on cause:
- When Supabase is disabled (`VITE_SUPABASE_ENABLED=false`) or env missing, show “Live data disabled” message.
- When network errors occur, keep “Failed to load templates” with Retry.
2. Add fallback categories when live data is disabled or failing so CategoryFilter works.
3. Keep existing fallback template grid so the page remains functional.
4. Rebuild and preview to verify the home page no longer shows misleading errors and remains usable.

## Files To Update
- `src/pages/Index.tsx`: add fallback categories, render CategoryFilter with real or fallback data, improve error copy when disabled.
- `src/pages/Templates.tsx`: same as Index.

## Verification
- Build and preview. The home page should show a clear “Live data disabled” message with Categories and sample Templates when Supabase is disabled; when enabled and correct envs are used, live data loads normally.