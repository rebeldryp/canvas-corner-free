import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminGuard } from "@/admin/useAdminGuard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAdmin, isChecking } = useAdminGuard();
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-muted-foreground">Checking access…</div>
        </main>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-red-600">Access denied</div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/95">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-semibold">Admin</Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/admin/templates" className={({ isActive }) => isActive ? "text-foreground" : "text-foreground/70"}>Templates</NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? "text-foreground" : "text-foreground/70"}>Analytics</NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "text-foreground" : "text-foreground/70"}>Settings</NavLink>
            <Button
              variant="ghost"
              onClick={async () => {
                if (!supabase) { navigate('/login'); return; }
                await supabase.auth.signOut();
                navigate('/login');
              }}
            >Logout</Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
