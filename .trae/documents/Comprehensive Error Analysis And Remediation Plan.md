## 1) Error Identification
- Critical: Supabase DNS failures (`net::ERR_NAME_NOT_RESOLVED`) and aborted requests when env is invalid; blocks live data.
- High: Hard throw in `src/integrations/supabase/client.ts:9–14` on missing env can crash app in misconfig scenarios.
- Medium: Missing global error boundary; runtime React errors would bubble to console only.
- Low: Vite `server.host = "::"` might cause binding issues on some Windows setups; minor dev friction.
- Evidence:
  - Error toasts and logs: `src/pages/Index.tsx:63–67`, `src/pages/Templates.tsx:100–103`, `src/pages/TemplateDetail.tsx:67–68`
  - NotFound logs: `src/pages/NotFound.tsx:8`
  - Supabase gating: `Index.tsx:100–117,123–140`; `Templates.tsx:85–92,106–123`; `TemplateDetail.tsx:15–32`

## 2) Root Cause Analysis
- Frontend depends on Supabase env; invalid URL/anon key triggers DNS failures.
- The client’s hard throw on missing env turns configuration issues into app-level crashes.
- No error boundary to contain unexpected runtime exceptions at the React layer.

## 3) Remediation Planning
- Priority fixes:
  1. Env correctness: ensure a valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
  2. Replace hard throw with safe client init + UI messaging (reuse `SUPABASE_READY` gating already present).
  3. Add a global React error boundary for runtime exceptions.
  4. Optional: set Vite `server.host` to `0.0.0.0`/`true` for wider dev compatibility.
- Rollback: each change is reversible via single-file edits; no data migration.
- Tests: simulate missing/invalid env, offline mode, React runtime errors.

## 4) Implementation Steps
- Frontend:
  - Supabase client: guard init without throwing; export `null` or a wrapper that surfaces status.
  - App shell: add an ErrorBoundary at the root (wrap `BrowserRouter` or top-level layout).
  - Keep existing gating in pages; ensure error copy remains consistent.
- Database:
  - Confirm policies/triggers applied (already done). Seed minimal data for verification.
- Dev config:
  - Optionally change `vite.config.ts:9` host to `0.0.0.0`.

## 5) Validation
- Unit tests: client init with/without env; pages render fallback appropriately.
- Integration: fetch categories/templates with valid env; verify `download_logs` insert increments `downloads_count` via trigger.
- System: run build+preview and dev server; ensure no DNS errors when disabled; live data loads when enabled.
- Monitor: observe console logs and network tab; confirm error boundary catches simulated runtime exceptions.

## 6) Prevention
- CI checks for `.env` completeness in staging; fail fast on missing keys.
- Regression tests for offline mode and published-only visibility under RLS.
- Supabase monitoring enabled; alerts on high error rate.
- Document env management and rotation for keys; avoid service role keys in frontend.

## After Confirmation
- I will implement: safe Supabase client init, add a global ErrorBoundary, optional Vite host tweak, plus test scaffolding and documentation notes. Then rebuild and verify both disabled/enabled live data paths are clean.