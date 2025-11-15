import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminGuard() {
  const {
    data: session,
    isLoading: isLoadingSession,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    enabled: Boolean(supabase),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false
  });

  const { data: role } = useQuery({
    queryKey: ['role', session?.user?.id],
    queryFn: async () => {
      if (!supabase || !session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      if (error) return null;
      return data.role as string;
    },
    enabled: Boolean(supabase && session?.user?.id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false
  });

  // Enforce strict owner-only access on the frontend
  const enabled = import.meta.env.VITE_SUPABASE_ENABLED !== 'false';
  const ownerEmail = 'teforamokate48@gmail.com';
  const isOwner = Boolean(session?.user?.email && session.user.email === ownerEmail);

  // If Supabase is disabled, do NOT grant admin access
  const isAdmin = enabled && isOwner;

  // Avoid premature redirects while checking session state
  const isChecking = Boolean(supabase) && enabled && isLoadingSession;

  return { isAdmin, isChecking, session, role };
}
