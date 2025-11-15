## Diagnosis
- `net::ERR_NAME_NOT_RESOLVED` and `net::ERR_ABORTED` for Supabase REST calls indicate DNS resolution failure for `dtocsglmhgeryrqiddkl.supabase.co` and aborted fetches. Root causes: invalid `VITE_SUPABASE_URL` or unreachable Supabase project; not a client-side code bug.

## Fix Plan
1. Correct environment configuration:
- Update `.env` with the real `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from Supabase. Keep service role keys out of frontend.
2. Harden queries and UX:
- Add global React Query defaults (`retry: 2`, `refetchOnWindowFocus: false`).
- Gate queries with `enabled` when env variables are present.
- Provide graceful offline fallback lists for Categories/Templates when Supabase is unreachable, so the app remains usable.
3. Verify:
- Build and preview; confirm no runtime crashes, error messages are shown, and fallback data renders when Supabase is misconfigured.

## Implementation Targets
- `src/App.tsx`: initialize `QueryClient` with sane defaults.
- `src/pages/Index.tsx`, `src/pages/Templates.tsx`: add `enabled` guards and small in-component fallback datasets used on error or missing env.
- Keep existing error toasts and Retry actions.

## After Confirmation
- Implement the changes, rebuild, and provide the preview URL with checks for both configured and misconfigured env states.