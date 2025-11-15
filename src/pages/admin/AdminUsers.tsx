import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminProfile = { user_id: string; role: string; created_at: string };

// Simple admin users page that avoids direct use of import.meta.env.
// It relies on supabase client initialization to determine enabled state.
const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseEnabled = Boolean(supabase);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase!
          .from("profiles")
          .select("user_id, role, created_at")
          .limit(25);
        if (error) throw error;
        if (!cancelled) setUsers((data as AdminProfile[]) || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseEnabled]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Admin Users</h1>
      {!supabaseEnabled && (
        <div className="mt-4 text-sm text-muted-foreground">
          Supabase is disabled. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your environment to enable.
        </div>
      )}
      {supabaseEnabled && (
        <div className="mt-4">
          {loading && <div className="text-muted-foreground">Loading users…</div>}
          {error && <div className="text-destructive">{error}</div>}
          {!loading && !error && (
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.user_id} className="rounded border p-2">
                  <div className="font-medium">{u.user_id}</div>
                  <div className="text-xs text-muted-foreground">Role: {u.role}</div>
                  <div className="text-xs text-muted-foreground">Created: {new Date(u.created_at).toLocaleString()}</div>
                </li>
              ))}
              {users.length === 0 && (
                <li className="text-sm text-muted-foreground">No users found.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
