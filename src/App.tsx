import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { useAdminGuard } from "@/admin/useAdminGuard";
const Index = lazy(() => import("./pages/Index"));
const Templates = lazy(() => import("./pages/Templates"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./pages/Logout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));
const AdminTemplateEdit = lazy(() => import("./pages/admin/AdminTemplateEdit"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

 

// Route-level guard: only allow owner-admin to access children
const RequireOwnerAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isChecking } = useAdminGuard();
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Checking access…</div>
      </div>
    );
  }
  // Render children and rely on AdminLayout to block non-admin with UI messaging
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/template/:id" element={<TemplateDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              {/* Admin routes wrapped with RequireOwnerAdmin */}
              <Route path="/admin" element={<RequireOwnerAdmin><AdminDashboard /></RequireOwnerAdmin>} />
              <Route path="/admin/templates" element={<RequireOwnerAdmin><AdminTemplates /></RequireOwnerAdmin>} />
              <Route path="/admin/templates/:id" element={<RequireOwnerAdmin><AdminTemplateEdit /></RequireOwnerAdmin>} />
              <Route path="/admin/analytics" element={<RequireOwnerAdmin><AdminAnalytics /></RequireOwnerAdmin>} />
              <Route path="/admin/settings" element={<RequireOwnerAdmin><AdminSettings /></RequireOwnerAdmin>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
