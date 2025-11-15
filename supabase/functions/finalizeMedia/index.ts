import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Server env missing" }), { status: 500 });
    }
    const body = await req.json() as { templateId?: string; items?: Array<{ path: string; width?: number; height?: number; alt?: string }> };
    const { templateId, items } = body || {};
    if (!templateId || !Array.isArray(items) || items.length < 3) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), { status: 400 });
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
    const rows = items.map((it, idx: number) => ({
      template_id: templateId,
      image_url: it.path,
      width: it.width || null,
      height: it.height || null,
      alt_text: it.alt || '',
      sort_order: idx
    }));
    const { error: insertErr } = await admin.from('template_media').insert(rows);
    if (insertErr) return new Response(JSON.stringify({ ok: false, error: String(insertErr.message) }), { status: 500 });
    await admin.from('audit_logs').insert({ user_id: user.user.id, action: 'finalizeMedia', entity: 'template_media', entity_id: templateId, metadata: { count: rows.length } });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
