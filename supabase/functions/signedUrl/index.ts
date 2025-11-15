import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const body = await req.json() as { path?: string };
    const { path } = body || {};
    if (!path) return new Response(JSON.stringify({ ok: false, error: "Missing path" }), { status: 400 });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: true, url: `https://example.com/signed/${encodeURIComponent(path)}` }), { status: 200 });
    }
    const admin = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string);
    const { data, error } = await admin.storage.from('template-files').createSignedUrl(path, 60);
    if (error) return new Response(JSON.stringify({ ok: false, error: String(error.message) }), { status: 500 });
    return new Response(JSON.stringify({ ok: true, url: data?.signedUrl }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
