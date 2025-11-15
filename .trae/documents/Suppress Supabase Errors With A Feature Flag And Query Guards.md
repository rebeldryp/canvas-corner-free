## Goal
Stop the four repeating Supabase DNS/abort errors by preventing network calls when the environment isn’t configured.

## Plan
1. Add `VITE_SUPABASE_ENABLED` feature flag (default `false`) in `.env`.
2. Gate all data fetching behind this flag + presence of `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Ensure `TemplateDetail` also uses `enabled` guards.
4. Keep the existing offline fallback UI so the app remains usable.
5. Rebuild and preview to verify the logs stop.

## Files To Update
- `.env`: add `VITE_SUPABASE_ENABLED="false"`.
- `src/pages/Index.tsx`: compute `SUPABASE_READY` using the flag + env; queries use `enabled: SUPABASE_READY`.
- `src/pages/Templates.tsx`: same as Index.
- `src/pages/TemplateDetail.tsx`: add `SUPABASE_READY` and `enabled` to its query; show existing fallback when disabled.

## Verification
- Build and preview; confirm no Supabase network requests are made and logs are gone when the flag is false.
- When the user sets the flag to true and correct env values, fetching works normally.