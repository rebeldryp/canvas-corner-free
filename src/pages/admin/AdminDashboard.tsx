import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { useAdminGuard } from "@/admin/useAdminGuard";

export default function AdminDashboard() {
  const { isAdmin } = useAdminGuard();
  return (
    <AdminLayout>
      {!isAdmin && <div className="mb-6 text-red-600">Access denied</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/templates" className="border rounded-lg p-6 hover:bg-card/50 transition">
          <div className="font-semibold mb-2">Template Management</div>
          <div className="text-sm text-muted-foreground">Upload and manage template versions and previews</div>
        </Link>
        <Link to="/admin/analytics" className="border rounded-lg p-6 hover:bg-card/50 transition">
          <div className="font-semibold mb-2">Analytics</div>
          <div className="text-sm text-muted-foreground">Downloads and engagement</div>
        </Link>
        <Link to="/admin/settings" className="border rounded-lg p-6 hover:bg-card/50 transition">
          <div className="font-semibold mb-2">Settings</div>
          <div className="text-sm text-muted-foreground">Limits, CDN, and configuration</div>
        </Link>
      </div>
    </AdminLayout>
  );
}
