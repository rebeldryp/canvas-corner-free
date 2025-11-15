## Remaining Issues
- No UI for `react-query` errors in `Index.tsx`, `Templates.tsx`, `TemplateDetail.tsx`; users see blank sections on failures.
- Supabase client creates with env values but no validation; missing `.env` values would cause opaque runtime errors.

## Fix Plan
1. Add error states to pages:
- Capture `error` from `useQuery` and render a friendly message with a Retry button (`refetch`).
- Use `toast.error` for visibility.
2. Validate env before creating Supabase client:
- Check `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` exist; throw a clear error if absent.
3. Verify by building and previewing, and exercising error paths (temporarily simulate failure with wrong URL if needed).

## Implementation
- Edit `Index.tsx`, `Templates.tsx`, `TemplateDetail.tsx` to branch on `error` and render fallback UI.
- Update `src/integrations/supabase/client.ts` to guard URL/KEY before `createClient`.
- Rebuild and preview to confirm stability.

## Outcome
- Clear feedback on data load failures and safe initialization when env is misconfigured. Reduced user confusion and faster debugging.