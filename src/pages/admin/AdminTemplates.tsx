import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AdminTemplates() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allowedTemplateTypes = ["application/zip", "application/x-zip-compressed", "image/vnd.adobe.photoshop", "application/pdf", "application/postscript"]; 

  const validate = () => {
    setError(null);
    if (!title || !category || !license || !version) return setError("Missing required fields");
    if (!file) return setError("Select a template file");
    if (file.size > 50 * 1024 * 1024) return setError("File exceeds 50MB limit");
    if (!allowedTemplateTypes.includes(file.type)) return setError("Unsupported file type");
    return true;
  };

  const submit = async () => {
    if (validate() !== true) return;
    setSuccess(null);
    if (!supabase) { setSuccess("Live data disabled. Form validated."); return; }
    try {
      const { data, error } = await supabase.functions.invoke('uploadTemplate', {
        body: {
          title,
          description,
          category,
          tags,
          license,
          version,
          fileMeta: { name: file?.name, size: file?.size, type: file?.type }
        }
      });
      if (error) throw error;
      if (data?.upload?.signedUrl && file) {
        const res = await fetch(data.upload.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
        if (!res.ok) throw new Error('Upload failed');
        const finalize = await supabase.functions.invoke('finalizeTemplate', {
          body: {
            title,
            description,
            license,
            category,
            tags,
            version,
            filePath: data.upload.path,
            fileFormat: file.type,
            fileSize: file.size
          }
        });
        if (finalize.error) throw finalize.error;
        const templateId = finalize.data?.templateId;
        setSuccess('Template created');
        if (templateId) navigate(`/admin/templates/${templateId}`);
      } else {
        setSuccess('Server validation passed');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Upload failed');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-4">
        <div className="text-2xl font-semibold">Upload Template</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Tags (comma-separated)" value={tags.join(",")} onChange={(e) => setTags(e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} />
        <input className="w-full border rounded p-2" placeholder="License" value={license} onChange={(e) => setLicense(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="border rounded px-4 py-2" onClick={submit}>Validate & Submit</button>
      </div>
    </AdminLayout>
  );
}
