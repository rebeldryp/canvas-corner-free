import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Server env missing" }), { status: 500 });
    }
    const body = await req.json() as { title?: string; description?: string; license?: string; category?: string; tags?: string[]; version?: string; filePath?: string; fileFormat?: string; fileSize?: number };
    const { title, description, license, category, tags, version, filePath, fileFormat, fileSize } = body || {};
    if (!title || !license || !version || !filePath) {
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
    let categoryId: string | null = null;
    if (category) {
      const { data: cat } = await admin.from('categories').select('id, slug, name').or(`slug.eq.${category},name.eq.${category}`).limit(1).single();
      if (cat?.id) categoryId = cat.id;
    }
    const { data: t, error: tErr } = await admin.from('templates').insert({
      title,
      description,
      license,
      category_id: categoryId,
      file_formats: tags || [],
      is_published: false,
      preview_url: '',
      source_file_url: filePath,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.user.id
    }).select('id').single();
    if (tErr) return new Response(JSON.stringify({ ok: false, error: String(tErr.message) }), { status: 500 });
    const { data: v, error: vErr } = await admin.from('template_versions').insert({
      template_id: t.id,
      version,
      file_url: filePath,
      file_format: fileFormat || 'zip',
      file_size: fileSize || 0,
      created_by: user.user.id
    }).select('id').single();
    if (vErr) return new Response(JSON.stringify({ ok: false, error: String(vErr.message) }), { status: 500 });
    await admin.from('templates').update({ current_version_id: v.id }).eq('id', t.id);
    await admin.from('audit_logs').insert({ user_id: user.user.id, action: 'finalizeTemplate', entity: 'template', entity_id: t.id, metadata: { version } });
    return new Response(JSON.stringify({ ok: true, templateId: t.id, versionId: v.id }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
