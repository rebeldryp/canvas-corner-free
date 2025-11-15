import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const body = await req.json() as { title?: string; category?: string; license?: string; version?: string; fileMeta?: { name: string; size: number; type?: string } };
    const { title, category, license, version, fileMeta } = body || {};
    if (!title || !category || !license || !version || !fileMeta) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), { status: 400 });
    }
    if (fileMeta.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ ok: false, error: "File exceeds 50MB limit" }), { status: 413 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: true, message: "Validated (no server env)" }), { status: 200 });
    }
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    const admin = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string);
    const { data: user } = await admin.auth.getUser(jwt);
    if (!user?.user) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const { data: profile } = await admin.from('profiles').select('role').eq('user_id', user.user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'editor') {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
    }
    const path = `templates/${crypto.randomUUID()}/${encodeURIComponent(fileMeta.name)}`;
    const { data: signed, error: signErr } = await admin.storage.from('template-files').createSignedUploadUrl(path);
    if (signErr) return new Response(JSON.stringify({ ok: false, error: String(signErr.message) }), { status: 500 });
    await admin.from('audit_logs').insert({
      user_id: user.user.id,
      action: 'uploadTemplate',
      entity: 'template',
      metadata: { title, version, category, license, fileMeta },
      ip_address: req.headers.get('x-forwarded-for') || null,
    });
    return new Response(JSON.stringify({ ok: true, upload: { path, signedUrl: signed?.signedUrl } }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
