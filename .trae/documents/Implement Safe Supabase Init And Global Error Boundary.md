## Changes To Apply
- Supabase client: initialize safely without throwing on missing env; export `supabase` as `null` when disabled or incomplete. Pages already gate queries via `SUPABASE_READY`.
- Error Boundary: add a global React ErrorBoundary with a minimal fallback and wrap the router in `App.tsx`.
- Dev host (optional): set Vite `server.host` to `0.0.0.0` for broader Windows compatibility.

## Files
- `src/integrations/supabase/client.ts`: guard init and export `null` when not ready.
- `src/components/ErrorBoundary.tsx`: new component.
- `src/App.tsx`: wrap with ErrorBoundary.
- `vite.config.ts`: optional host tweak.

## Verification
- Build + preview in disabled mode: no crashes; fallback UI intact; no Supabase network errors.
- Enable env and test live data path; confirm normal behavior.

Confirm and I’ll implement these changes and verify locally.