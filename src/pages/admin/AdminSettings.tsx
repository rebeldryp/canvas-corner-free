import AdminLayout from "./AdminLayout";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-4 max-w-2xl">
        <div className="text-2xl font-semibold">Settings</div>
        <div className="border rounded p-4 space-y-2">
          <div className="text-sm">Template size limit: 50MB</div>
          <div className="text-sm">Image size limit: 5MB</div>
          <div className="text-sm">Image min width: 1200px</div>
          <div className="text-sm">CDN: enabled for public media</div>
        </div>
      </div>
    </AdminLayout>
  );
}
