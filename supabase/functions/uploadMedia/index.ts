import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const body = await req.json() as { items?: Array<{ name: string; size: number; type: string; width: number }> };
    const { items } = body || {};
    if (!Array.isArray(items) || items.length < 3) {
      return new Response(JSON.stringify({ ok: false, error: "Upload at least 3 images" }), { status: 400 });
    }
    for (const it of items) {
      if (it.size > 5 * 1024 * 1024) return new Response(JSON.stringify({ ok: false, error: "Image exceeds 5MB limit" }), { status: 413 });
      if (!['image/jpeg','image/png','image/webp'].includes(it.type)) return new Response(JSON.stringify({ ok: false, error: "Unsupported image format" }), { status: 415 });
      if (it.width < 1200) return new Response(JSON.stringify({ ok: false, error: "Image width must be at least 1200px" }), { status: 400 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: true, message: "Validated (no server env)", count: items.length }), { status: 200 });
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
    const uploads: Array<{ path: string; signedUrl: string | null }> = [];
    for (const it of items) {
      const path = `media/${crypto.randomUUID()}-${encodeURIComponent(it.name)}`;
      const { data: signed, error: signErr } = await admin.storage.from('template-media').createSignedUploadUrl(path);
      if (signErr) return new Response(JSON.stringify({ ok: false, error: String(signErr.message) }), { status: 500 });
      uploads.push({ path, signedUrl: signed?.signedUrl ?? null });
    }
    await admin.from('audit_logs').insert({
      user_id: user.user.id,
      action: 'uploadMedia',
      entity: 'template_media',
      metadata: { items },
      ip_address: req.headers.get('x-forwarded-for') || null,
    });
    return new Response(JSON.stringify({ ok: true, uploads }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
