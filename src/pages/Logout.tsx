import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        if (supabase) {
          await supabase.auth.signOut({ scope: "global" });
        }
      } finally {
        navigate("/login", { replace: true });
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Signing out…</div>
    </div>
  );
}