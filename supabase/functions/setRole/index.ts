import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OWNER_USER_ID = Deno.env.get('OWNER_USER_ID');
    const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Server env missing" }), { status: 500 });
    }
    const body = await req.json() as { userId?: string; role?: 'admin' | 'editor' | 'viewer' };
    const { userId, role } = body || {};
    if (!userId || !role || !['admin','editor','viewer'].includes(role)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid request" }), { status: 400 });
    }
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    const url = SUPABASE_URL as string;
    const key = SUPABASE_SERVICE_ROLE_KEY as string;
    const admin = createClient(url, key);
    const { data: user } = await admin.auth.getUser(jwt);
    if (!user?.user) return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
    const requesterId = user.user.id;
    const requesterEmail = (user.user?.email as string | undefined) ?? null;
    const isOwner = (OWNER_USER_ID && requesterId === OWNER_USER_ID) || (OWNER_EMAIL && requesterEmail === OWNER_EMAIL);
    if (!isOwner) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403 });
    }
    if (role === 'admin') {
      if (!OWNER_USER_ID || userId !== OWNER_USER_ID) {
        return new Response(JSON.stringify({ ok: false, error: 'Admin role restricted to owner' }), { status: 403 });
      }
    }
    const { error: updErr } = await admin.from('profiles').update({ role }).eq('user_id', userId);
    if (updErr) return new Response(JSON.stringify({ ok: false, error: String(updErr.message) }), { status: 500 });
    await admin.from('audit_logs').insert({
      user_id: user.user.id,
      action: 'setRole',
      entity: 'profiles',
      entity_id: userId,
      metadata: { role },
      ip_address: req.headers.get('x-forwarded-for') || null,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
  }
});
